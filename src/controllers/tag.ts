import express from "express";

import Tag from "../models/tag";
import { Request, RequestBody } from "../@types/request";
import { Tag as TagType } from "../@types/models";
import * as CRUD from "../utils/crud";

const populate = ["category"];

/**
 * @desc Add Tag
 * @route POST /api/v1/tags
 * @access Restricted
 */
export async function addTag(req: RequestBody<TagType>, res: express.Response) {
    await CRUD.create<TagType>(
        req,
        res,
        "tag",
        Tag,
        undefined,
        undefined,
        populate
    );
}

/**
 * @desc Get Tag
 * @route GET /api/v1/tags/:id
 * @access Public
 */
export async function getTag(req: Request, res: express.Response) {
    await CRUD.read<TagType>(req, res, "tag", Tag, undefined, populate);
}

/**
 * @desc Get Tags
 * @route GET /api/v1/tags
 * @access Public
 */
export async function getTags(req: Request, res: express.Response) {
    const {
        appliesToProvider,
        appliesToCourse
    }: { appliesToProvider?: string; appliesToCourse?: string } = req.query;

    const query: { appliesToProvider?: boolean; appliesToCourse?: boolean } =
        {};

    if (appliesToProvider)
        query.appliesToProvider = appliesToProvider.toLowerCase() === "true";
    if (appliesToCourse)
        query.appliesToCourse = appliesToCourse.toLowerCase() === "true";

    await CRUD.readAll<TagType>(
        req,
        res,
        "tag",
        Tag,
        query,
        undefined,
        populate
    );
}

/**
 * @desc Modify Tag
 * @route PATCH /api/v1/tags/:id
 * @access Restricted
 */
export async function modifyTag(
    req: RequestBody<TagType>,
    res: express.Response
) {
    await CRUD.update<TagType>(req, res, "tag", Tag, undefined, populate);
}

/**
 * @desc DELETE Tag
 * @route DELETE /api/v1/tags/:id
 * @access Restricted
 */
export async function deleteTag(req: Request, res: express.Response) {
    await CRUD.del<TagType>(req, res, "tag", Tag, populate);
}
