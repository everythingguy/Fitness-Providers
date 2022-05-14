import express from "express";

import Provider from "../models/provider";
import Course from "../models/course";
import Session from "../models/session";
import { Request, RequestBody } from "../@types/request";
import {
  Provider as ProviderType,
  Session as SessionType,
} from "../@types/models";
import * as CRUD from "../utils/crud";
import { FilterQuery } from "mongoose";

/**
 * @desc Add a session to a course
 * @route POST /api/v1/sessions
 * @access Restricted
 */
export async function addSession(
  req: RequestBody<SessionType>,
  res: express.Response
) {
  await CRUD.create<SessionType>(req, res, "session", Session, ["image"]);
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
  await CRUD.update<SessionType>(req, res, "session", Session, ["image"]);
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
    const providerFilter: FilterQuery<ProviderType>[] = [{ isEnrolled: true }];
    if (req.provider) providerFilter.push({ _id: req.provider._id });

    const approvedProviders = await Provider.find({
      $or: providerFilter,
    }).select("_id");

    const approvedCourses = await Course.find({
      provider: approvedProviders,
    }).select("_id");

    query = { course: approvedCourses, _id: req.params.id };
  }

  await CRUD.read<SessionType>(req, res, "session", Session, query);
}

/**
 * @desc Get all sessions
 * @route GET /api/v1/sessions
 * @access Public
 */
export async function getSessions(req: Request, res: express.Response) {
  // hide sessions that belong to unenrolled providers
  // unless the logged in user is admin or the owner of the session
  let query: FilterQuery<SessionType>;

  if (req.user && req.user.isAdmin) query = {};
  else {
    const providerFilter: FilterQuery<ProviderType>[] = [{ isEnrolled: true }];
    if (req.provider) providerFilter.push({ _id: req.provider._id });

    const approvedProviders = await Provider.find({
      $or: providerFilter,
    }).select("_id");

    const approvedCourses = await Course.find({
      provider: approvedProviders,
    }).select("_id");

    query = { course: approvedCourses };
  }

  await CRUD.readAll<SessionType>(req, res, "session", Session, query);
}

/**
 * @desc Delete a session
 * @route DELETE /api/v1/sessions/:id
 * @access Restricted
 */
export async function deleteSession(req: Request, res: express.Response) {
  await CRUD.del<SessionType>(req, res, "session", Session);
}
