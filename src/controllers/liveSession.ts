import express from "express";

import Provider from "../models/provider";
import Course from "../models/course";
import Session from "../models/session";
import LiveSession from "../models/liveSession";
import { Request, RequestBody } from "../@types/request";
import {
    Provider as ProviderType,
    Session as SessionType,
    LiveSession as LiveSessionType
} from "../@types/models";
import * as CRUD from "../utils/crud";
import { FilterQuery } from "mongoose";

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
    const { provider, course, session } = req.query;

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
                query.$and.push({ session: courseSessions });
            }
            if (provider) {
                const providerCourses = await Course.find({ provider });
                const courseSessions = await Session.find({
                    course: providerCourses
                });

                query.$and.push({ session: courseSessions });
            }
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

        const approvedCourses = await Course.find({
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
                $and: [{ session: approvedSessions }, { session }]
            };
        else query = { session: approvedSessions };
    }

    await CRUD.readAll<LiveSessionType>(
        req,
        res,
        "liveSession",
        LiveSession,
        query,
        undefined,
        populate
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
