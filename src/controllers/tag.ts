import express from "express";

import Tag from "../models/tag";
import { Request, RequestBody } from "../@types/request";
import { Tag as TagType } from "../@types/models";
import * as CRUD from "../utils/crud";

/**
 * @desc Add Tag
 * @route POST /api/v1/tags
 * @access Restricted
 */
export async function addTag(req: RequestBody<TagType>, res: express.Response) {
  CRUD.create<TagType>(req, res, "tag", Tag);
}

/**
 * @desc Get Tag
 * @route GET /api/v1/tags/:id
 * @access Public
 */
export async function getTag(req: Request, res: express.Response) {
  CRUD.read<TagType>(req, res, "tag", Tag);
}

/**
 * @desc Get Tags
 * @route GET /api/v1/tags
 * @access Public
 */
export async function getTags(req: Request, res: express.Response) {
  CRUD.readAll<TagType>(req, res, "tag", Tag);
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
  CRUD.update<TagType>(req, res, "tag", Tag);
}

/**
 * @desc DELETE Tag
 * @route DELETE /api/v1/tags/:id
 * @access Restricted
 */
export async function deleteTag(req: Request, res: express.Response) {
  CRUD.del<TagType>(req, res, "tag", Tag);
}
