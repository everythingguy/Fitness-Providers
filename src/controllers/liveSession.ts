import express from "express";

import Provider from "../models/provider";
import Course from "../models/course";
import Session from "../models/session";
import LiveSession from "../models/liveSession";
import { Request, RequestBody } from "../@types/request";
import {
    Provider as ProviderType,
    Course as CourseType,
    Session as SessionType,
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
    const { provider, course, session, day, search } = req.query;

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

    // hide sessions that belong to unenrolled providers
    // unless the logged in user is admin or the owner of the session
    let query: FilterQuery<LiveSessionType>;

    if (req.user && req.user.isAdmin) {
        query = {};
        if (session || course || provider) {
            query = { $and: [] };
            if (session) query.$and.push({ session });
            if (course) {
                const courseSessions = await Session.find({ course });
                query.$and.push({ session: { $in: courseSessions } });
            }
            if (provider) {
                const courseQuery: FilterQuery<CourseType> = { provider };
                if (tagFilter.length > 0) courseQuery.tags = tagFilter;

                const providerCourses = await Course.find(courseQuery);

                const courseSessions = await Session.find({
                    course: providerCourses
                });

                query.$and.push({ session: { $in: courseSessions } });
            }
        }
        if (tagFilter.length > 0 && !provider) {
            const tagCourses = await Course.find({ tags: tagFilter });
            const tagSessions = await Session.find({ course: tagCourses });

            query = appendQuery(query, { session: { $in: tagSessions } });
        }
    } else {
        const providerFilter: FilterQuery<ProviderType>[] = [
            { isEnrolled: true }
        ];
        if (req.provider) providerFilter.push({ _id: req.provider._id });

        let provFilter: FilterQuery<ProviderType> = {
            $or: providerFilter
        };

        if (provider)
            provFilter = {
                $and: [{ $or: providerFilter }, { provider }]
            };

        const approvedProviders = await Provider.find(provFilter).select("_id");

        let approvedCourses: CourseType[];
        if (tagFilter.length > 0)
            approvedCourses = await Course.find({
                provider: approvedProviders,
                tags: tagFilter
            });
        else
            approvedCourses = await Course.find({
                provider: approvedProviders
            }).select("_id");

        let sessionFilter: FilterQuery<SessionType> = {
            course: approvedCourses
        };

        if (course)
            sessionFilter = { $and: [{ course: approvedCourses }, { course }] };

        const approvedSessions = await Session.find(sessionFilter).select(
            "_id"
        );

        if (session)
            query = {
                $and: [{ session: { $in: approvedSessions } }, { session }]
            };
        else query = { session: { $in: approvedSessions } };
    }

    if (search && search.length > 0) {
        const courses = await Course.find({
            name: { $regex: search, $options: "i" }
        });
        const sessions = await Session.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { course: courses }
            ]
        });

        query = appendQuery(query, {
            session: { $in: sessions }
        });
    }

    let isAggregate = false;

    if (day) {
        isAggregate = true;

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
                    date
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
                $addFields: {
                    "session.course.location": "$location",
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
                                if (recurring) {
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
                $project: { course: 0, location: 0, onFrequency: 0, date: 0 }
            }
        ];
    }

    await CRUD.readAll<LiveSessionType>(
        req,
        res,
        "liveSession",
        LiveSession,
        query,
        undefined,
        populate,
        isAggregate
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
