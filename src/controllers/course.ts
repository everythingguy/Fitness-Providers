import express from "express";

import Course from "../models/course";
import Provider from "../models/provider";
import { Request, RequestBody } from "../@types/request";
import {
    Course as CourseType,
    Provider as ProviderType
} from "../@types/models";
import * as CRUD from "../utils/crud";
import { FilterQuery, Types } from "mongoose";
import { filterTags } from "./../utils/filter";
import { appendQuery } from "./../utils/query";

const populate = [
    { path: "location" },
    { path: "tags" },
    {
        path: "provider",
        populate: [
            {
                path: "user",
                model: "User",
                select: "firstName lastName name email username"
            },
            { path: "tags", model: "Tag" }
        ]
    }
];

/**
 * @desc Add a course to a provider
 * @route POST /api/v1/courses
 * @access Restricted
 */
export async function addCourse(
    req: RequestBody<CourseType>,
    res: express.Response
) {
    await CRUD.create<CourseType>(
        req,
        res,
        "course",
        Course,
        ["image"],
        [
            {
                source: "provider",
                value: "provider"
            }
        ],
        populate
    );
}

/**
 * @desc Modify a course
 * @route PATCH /api/v1/courses/:id
 * @access Restricted
 */
export async function modifyCourse(
    req: RequestBody<CourseType>,
    res: express.Response
) {
    await CRUD.update<CourseType>(
        req,
        res,
        "course",
        Course,
        ["image"],
        populate
    );
}

/**
 * @desc Get a course by id
 * @route GET /api/v1/courses/:id
 * @access Public
 */
export async function getCourse(req: Request, res: express.Response) {
    // hide courses that belong to unenrolled providers
    // unless the logged in user is admin or the owner of the course
    const providerFilter: FilterQuery<ProviderType>[] = [{ isEnrolled: true }];
    if (req.provider) providerFilter.push({ _id: req.provider._id });

    const approvedProviders = await Provider.find({
        $or: providerFilter
    }).select("_id");

    let query: FilterQuery<CourseType> = {
        provider: approvedProviders,
        _id: req.params.id
    };
    if (req.user && req.user.isAdmin) query = { _id: req.params.id };

    await CRUD.read<CourseType>(req, res, "course", Course, query, populate);
}

/**
 * @desc Get all courses
 * @route GET /api/v1/courses
 * @access Public
 */
export async function getCourses(req: Request, res: express.Response) {
    const { provider, search } = req.query;

    // filter based on tags
    const tagFilter: Types.ObjectId[] = filterTags(req);

    // hide courses that belong to unenrolled providers
    // unless the logged in user is admin or the owner of the course
    let query: FilterQuery<CourseType>;

    if (req.user && req.user.isAdmin) {
        query = {};
        if (tagFilter.length > 0) query.tags = tagFilter;
        if (provider) query.provider = provider;
    } else {
        const providerFilter: FilterQuery<ProviderType>[] = [
            { isEnrolled: true }
        ];
        if (req.provider) providerFilter.push({ _id: req.provider._id });

        const approvedProviders = await Provider.find({
            $or: providerFilter
        }).select("_id");

        if (provider)
            query = {
                $and: [
                    tagFilter.length > 0
                        ? {
                              provider: approvedProviders,
                              tags: tagFilter
                          }
                        : { provider: approvedProviders },
                    { provider }
                ]
            };
        else
            query =
                tagFilter.length > 0
                    ? {
                          provider: approvedProviders,
                          tags: tagFilter
                      }
                    : { provider: approvedProviders };
    }

    if (search)
        query = appendQuery(query, {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        });

    await CRUD.readAll(req, res, "course", Course, query, undefined, populate);
}

/**
 * @desc Delete a course
 * @route DELETE /api/v1/courses/:id
 * @access Restricted
 */
export async function deleteCourse(req: Request, res: express.Response) {
    await CRUD.del(req, res, "course", Course, populate);
}
