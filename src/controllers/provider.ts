import express from "express";

import { Provider, Address, User } from "../models";
import { Request, RequestBody } from "../@types/request";
import { Provider as ProviderType } from "../@types/models";
import * as CRUD from "../utils/crud";
import { FilterQuery, Types } from "mongoose";
import { filterTags } from "../utils/filter";
import { appendQuery } from "../utils/query";

const populate = [
    { path: "address" },
    { path: "tags" },
    { path: "user", select: "firstName lastName name email username" }
];

// middleware
// attach provider to req
export async function ReqProvider(
    req: Request,
    res: express.Response,
    next: express.NextFunction
) {
    if (req.user) {
        try {
            const provider = await Provider.findOne({
                user: req.user._id
            }).populate("address");
            if (provider) req.provider = provider;
        } catch (e) {
            req.provider = undefined;
        }
    }

    next();
}

/**
 * @desc Add Provider
 * @route POST /api/v1/providers
 * @access Restricted
 */
export async function addProvider(
    req: RequestBody<ProviderType>,
    res: express.Response
) {
    await CRUD.create<ProviderType>(
        req,
        res,
        "provider",
        Provider,
        ["isEnrolled", "image", "address"],
        [
            {
                source: "user",
                value: "user"
            }
        ],
        populate
    );
}

/**
 * @desc Get Provider
 * @route GET /api/v1/providers/:id
 * @access Public
 */
export async function getProvider(req: Request, res: express.Response) {
    // hide providers that are not enrolled
    // unless logged in user is admin or the provider they are looking for
    const query: FilterQuery<ProviderType>[] = [
        { isEnrolled: true, _id: req.params.id }
    ];
    if (req.user) query.push({ user: req.user._id, _id: req.params.id });
    if (req.user && req.user.isAdmin) query.push({ _id: req.params.id });

    await CRUD.read<ProviderType>(
        req,
        res,
        "provider",
        Provider,
        {
            $or: query
        },
        populate
    );
}

/**
 * @desc Get Providers
 * @route GET /api/v1/providers
 * @access Public
 */
export async function getProviders(req: Request, res: express.Response) {
    const { search, zip } = req.query;
    // filter based on tags
    const tagFilter: Types.ObjectId[] = filterTags(req);

    // hide providers that are not enrolled
    // unless logged in user is admin or the provider
    let query: FilterQuery<ProviderType>[] | FilterQuery<ProviderType> = [
        tagFilter.length > 0
            ? { isEnrolled: true, tags: { $all: tagFilter } }
            : { isEnrolled: true }
    ];
    if (req.provider)
        query.push(
            tagFilter.length > 0
                ? { _id: req.provider._id, tags: { $all: tagFilter } }
                : { _id: req.provider._id }
        );
    if (req.user && req.user.isAdmin)
        query.push(tagFilter.length > 0 ? { tags: { $all: tagFilter } } : {});

    if (search) {
        const searchUsers = await User.aggregate([
            {
                $addFields: {
                    name: {
                        $concat: ["$firstName", " ", "$lastName"]
                    }
                }
            },
            {
                $match: {
                    name: { $regex: search, $options: "i" }
                }
            },
            {
                $project: { _id: 1 }
            }
        ]);

        const searchAddresses = await Address.find({
            $or: [
                { city: { $regex: search, $options: "i" } },
                { state: { $regex: search, $options: "i" } }
            ]
        }).select("_id");

        query = {
            $and: [
                { $or: query as FilterQuery<ProviderType>[] },
                {
                    $or: [{ user: searchUsers }, { address: searchAddresses }]
                }
            ]
        };
    } else
        query = {
            $or: query as FilterQuery<ProviderType>[]
        };

    if (zip) {
        const addrQuery = await Address.find({ zip });
        query = appendQuery(query, {
            address: addrQuery
        });
    }

    await CRUD.readAll<ProviderType>(
        req,
        res,
        "provider",
        Provider,
        query,
        undefined,
        populate
    );
}

/**
 * @desc Delete Provider
 * @route DELETE /api/v1/providers/:id
 * @access Restricted
 */
export async function deleteProvider(req: Request, res: express.Response) {
    await CRUD.del(req, res, "provider", Provider, populate);
}

/**
 * @desc Modify Provider
 * @route PATCH /api/v1/providers/:id
 * @access Restricted
 */
export async function modifyProvider(
    req: RequestBody<ProviderType>,
    res: express.Response
) {
    await CRUD.update(req, res, "provider", Provider, ["isEnrolled"], populate);
}
