import express from "express";

import Provider from "../models/provider";
import Course from "../models/course";
import Session from "../models/session";
import LiveSession from "../models/liveSession";
import { Request, RequestBody } from "../@types/request";
import {
    Provider as ProviderType,
    LiveSession as LiveSessionType
} from "../@types/models";
import * as CRUD from "../utils/crud";
import { FilterQuery, Types } from "mongoose";
import { errorResponse } from "../@types/response.d";
import { appendQuery } from "../utils/query";
import { filterTags } from "../utils/filter";
import { getDay } from "../utils/date";
import { WeekDays } from "../@types/enums";

// WARNING: Get all live sessions with a day filter manually populates using a aggregate
const populate = [
    {
        path: "session",
        populate: {
            path: "course",
            model: "Course",
            populate: [
                {
                    path: "provider",
                    model: "Provider",
                    populate: [
                        {
                            path: "user",
                            model: "User",
                            select: "firstName lastName name email username"
                        },
                        { path: "tags", model: "Tag" }
                    ]
                },
                { path: "location", model: "Address" },
                { path: "tags", model: "Tag" }
            ]
        }
    }
];

/**
 * @desc Add a live session to a session
 * @route POST /api/v1/live-sessions
 * @access Restricted
 */
export async function addLiveSession(
    req: RequestBody<LiveSessionType>,
    res: express.Response
) {
    await CRUD.create<LiveSessionType>(
        req,
        res,
        "liveSession",
        LiveSession,
        undefined,
        undefined,
        populate
    );
}

/**
 * @desc Modify a live session
 * @route PATCH /api/v1/live-sessions/:id
 * @access Restricted
 */
export async function modifyLiveSession(
    req: RequestBody<LiveSessionType>,
    res: express.Response
) {
    await CRUD.update<LiveSessionType>(
        req,
        res,
        "liveSession",
        LiveSession,
        undefined,
        populate
    );
}

/**
 * @desc Get a live session by id
 * @route GET /api/v1/live-sessions/:id
 * @access Public
 */
export async function getLiveSession(req: Request, res: express.Response) {
    // hide sessions that belong to unenrolled providers
    // unless the logged in user is admin or the owner of the session
    let query: FilterQuery<LiveSessionType>;

    if (req.user && req.user.isAdmin) query = { _id: req.params.id };
    else {
        const providerFilter: FilterQuery<ProviderType>[] = [
            { isEnrolled: true }
        ];
        if (req.provider) providerFilter.push({ _id: req.provider._id });

        const approvedProviders = await Provider.find({
            $or: providerFilter
        }).select("_id");

        const approvedCourses = await Course.find({
            provider: approvedProviders
        }).select("_id");

        const approvedSessions = await Session.find({
            course: approvedCourses
        }).select("_id");

        query = { session: approvedSessions, _id: req.params.id };
    }

    await CRUD.read<LiveSessionType>(
        req,
        res,
        "liveSession",
        LiveSession,
        query,
        populate
    );
}

/**
 * @desc Get all live sessions
 * @route GET /api/v1/live-sessions
 * @access Public
 */
export async function getLiveSessions(req: Request, res: express.Response) {
    const { provider, course, session, day, search, zip } = req.query;

    if (req.query.sort === undefined) req.query.sort = "beginDateTime";

    const tagFilter: Types.ObjectId[] = filterTags(req);

    let date: Date | null;

    if (day) {
        try {
            date = new Date(day as string);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: { date: "unable to parse date" }
            } as errorResponse);
        }
    }

    let query: FilterQuery<LiveSessionType> = {};

    // hide sessions that belong to unenrolled providers
    // unless the logged in user is admin or the owner of the session
    if (!(req.user && req.user.isAdmin))
        query = appendQuery(query, {
            "session.course.provider.isEnrolled": true
        });

    if (session) query["session._id"] = session;
    if (course) query["session.course._id"] = course;
    if (provider) query["session.course.provider._id"] = provider;
    if (tagFilter.length > 0)
        query["session.course.tags"] = { $all: tagFilter };
    if (zip) query["session.course.location.zip"] = zip;

    if (search && search.length > 0) {
        query = appendQuery(query, {
            $or: [
                {
                    "session.course.name": { $regex: search, $options: "i" }
                },
                {
                    "session.name": { $regex: search, $options: "i" }
                }
            ]
        });
    }

    if (day) {
        let nextDay = new Date(date);
        nextDay = new Date(nextDay.setDate(date.getDate() + 1));

        const dayEnum = getDay(date);

        query = appendQuery(query, {
            $or: [
                {
                    beginDateTime: {
                        $gte: date,
                        $lt: nextDay
                    }
                },
                {
                    endDateTime: {
                        $gte: date
                    },
                    beginDateTime: {
                        $lte: date
                    },
                    onFrequency: true,
                    "recurring.weekDays": dayEnum
                }
            ]
        });
    }

    query = [
        {
            $lookup: {
                from: "sessions",
                localField: "session",
                foreignField: "_id",
                as: "session"
            }
        },
        { $unwind: "$session" },
        {
            $lookup: {
                from: "courses",
                localField: "session.course",
                foreignField: "_id",
                as: "course"
            }
        },
        { $unwind: "$course" },
        {
            $addFields: {
                "session.course": "$course",
                date: date ? date : undefined
            }
        },
        {
            $lookup: {
                from: "addresses",
                localField: "session.course.location",
                foreignField: "_id",
                as: "location"
            }
        },
        { $unwind: "$location" },
        {
            $lookup: {
                from: "providers",
                localField: "session.course.provider",
                foreignField: "_id",
                as: "provider"
            }
        },
        { $unwind: "$provider" },
        {
            $addFields: {
                "session.course.location": "$location",
                "session.course.provider": "$provider",
                onFrequency: {
                    $function: {
                        body: function (
                            beginDateTime: Date,
                            recurring: {
                                weekDays: WeekDays[];
                                frequency: number;
                            } | null,
                            date: Date
                        ) {
                            // determine if date is within frequency
                            if (date && recurring) {
                                return (
                                    Math.round(
                                        (beginDateTime.getTime() -
                                            date.getTime()) /
                                            (7 * 24 * 60 * 60 * 1000)
                                    ) %
                                        recurring.frequency ===
                                    0
                                );
                            } else return false;
                        },
                        args: ["$beginDateTime", "$recurring", "$date"],
                        lang: "js"
                    }
                }
            }
        },
        { $match: query },
        {
            $project: {
                course: 0,
                location: 0,
                provider: 0,
                onFrequency: 0,
                date: 0
            }
        }
    ];

    if (day) {
        query.push({
            $addFields: {
                hour: { $hour: "$beginDateTime" },
                minute: { $minute: "$beginDateTime" }
            }
        });

        query.push({
            $sort: { hour: 1, minute: 1, _id: 1 }
        });

        query.push({
            $project: {
                hour: 0,
                minute: 0
            }
        });
    } else query.push({ $sort: { beginDateTime: 1, _id: 1 } });

    await CRUD.readAll<LiveSessionType>(
        req,
        res,
        "liveSession",
        LiveSession,
        query,
        undefined,
        populate,
        true,
        false
    );
}

/**
 * @desc Delete a live session
 * @route DELETE /api/v1/live-sessions/:id
 * @access Restricted
 */
export async function deleteLiveSession(req: Request, res: express.Response) {
    await CRUD.del<LiveSessionType>(
        req,
        res,
        "liveSession",
        LiveSession,
        populate
    );
}
