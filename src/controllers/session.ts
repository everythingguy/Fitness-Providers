import express from "express";

import Address from "../models/address";
import Provider from "../models/provider";
import Course from "../models/course";
import Session from "../models/session";
import { Request, RequestBody } from "../@types/request";
import {
    Provider as ProviderType,
    Course as CourseType,
    Session as SessionType
} from "../@types/models";
import * as CRUD from "../utils/crud";
import { filterTags } from "../utils/filter";
import { FilterQuery, Types } from "mongoose";
import { appendQuery } from "./../utils/query";

const populate = [
    {
        path: "course",
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
    },
    { path: "liveSession" }
];

/**
 * @desc Add a session to a course
 * @route POST /api/v1/sessions
 * @access Restricted
 */
export async function addSession(
    req: RequestBody<SessionType>,
    res: express.Response
) {
    await CRUD.create<SessionType>(
        req,
        res,
        "session",
        Session,
        ["image"],
        undefined,
        populate
    );
}

/**
 * @desc Modify a session
 * @route PATCH /api/v1/sessions/:id
 * @access Restricted
 */
export async function modifySession(
    req: RequestBody<SessionType>,
    res: express.Response
) {
    await CRUD.update<SessionType>(req, res, "session", Session, [], populate);
}

/**
 * @desc Get a session by id
 * @route GET /api/v1/sessions/:id
 * @access Public
 */
export async function getSession(req: Request, res: express.Response) {
    // hide sessions that belong to unenrolled providers
    // unless the logged in user is admin or the owner of the session
    let query: FilterQuery<SessionType>;

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

        query = { course: approvedCourses, _id: req.params.id };
    }

    await CRUD.read<SessionType>(req, res, "session", Session, query, populate);
}

/**
 * @desc Get all sessions
 * @route GET /api/v1/sessions
 * @access Public
 */
export async function getSessions(req: Request, res: express.Response) {
    const { provider, course, search, live, zip } = req.query;

    const blnLive =
        live !== undefined && live !== null
            ? (live as any) === true ||
              (live as string).toLowerCase() === "true"
            : undefined;

    const tagFilter: Types.ObjectId[] = filterTags(req);

    // hide sessions that belong to unenrolled providers
    // unless the logged in user is admin or the owner of the session
    let query: FilterQuery<SessionType>;

    if (req.user && req.user.isAdmin) {
        query = {};
        const courseQuery: FilterQuery<CourseType> = {};

        if (provider) courseQuery.provider = provider;
        if (course) courseQuery._id = course;
        if (tagFilter.length > 0) courseQuery.tags = tagFilter;

        if (zip) {
            const addrQuery = await Address.find({ zip });
            courseQuery.location = addrQuery;
        }

        if (Object.keys(courseQuery).length === 1 && course) {
            query = { course };
        } else if (Object.keys(courseQuery).length > 0) {
            const courses = await Course.find(courseQuery);
            query = { course: courses };
        }
    } else {
        const providerFilter: FilterQuery<ProviderType>[] = [
            { isEnrolled: true }
        ];
        if (req.provider) providerFilter.push({ _id: req.provider._id });

        const approvedProviders = await Provider.find({
            $or: providerFilter
        }).select("_id");

        let courseFilter: FilterQuery<CourseType> = {
            provider: approvedProviders
        };

        if (provider)
            courseFilter = {
                $and: [{ provider: approvedProviders }, { provider }]
            };

        if (tagFilter.length > 0 && provider)
            courseFilter.$and[0].tags = tagFilter;
        else if (tagFilter.length > 0) courseFilter.tags = tagFilter;

        if (zip) {
            const addrQuery = await Address.find({ zip });
            courseFilter = appendQuery(courseFilter, {
                location: addrQuery
            });
        }

        const approvedCourses = await Course.find(courseFilter).select("_id");

        if (course)
            query = {
                $and: [{ course: approvedCourses }, { course }]
            };
        else query = { course: approvedCourses };
    }

    if (search) {
        const searchCourses = await Course.find({
            name: { $regex: search, $options: "i" }
        });

        query = appendQuery(query, {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { course: searchCourses }
            ]
        });
    }

    if (blnLive)
        query = appendQuery(query, {
            liveSession: { $ne: null }
        });
    else if (blnLive === false)
        query = appendQuery(query, {
            liveSession: { $eq: null }
        });

    await CRUD.readAll<SessionType>(
        req,
        res,
        "session",
        Session,
        query,
        undefined,
        populate
    );
}

/**
 * @desc Delete a session
 * @route DELETE /api/v1/sessions/:id
 * @access Restricted
 */
export async function deleteSession(req: Request, res: express.Response) {
    await CRUD.del<SessionType>(req, res, "session", Session, populate);
}
