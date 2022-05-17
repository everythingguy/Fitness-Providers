import express from "express";

import Provider from "../models/provider";
import Course from "../models/course";
import Session from "../models/session";
import LiveSession from "../models/liveSession";
import { Request, RequestBody } from "../@types/request";
import {
  Provider as ProviderType,
  LiveSession as LiveSessionType,
} from "../@types/models";
import * as CRUD from "../utils/crud";
import { FilterQuery } from "mongoose";

/**
 * @desc Add a live session to a session
 * @route POST /api/v1/live-sessions
 * @access Restricted
 */
export async function addLiveSession(
  req: RequestBody<LiveSessionType>,
  res: express.Response
) {
  await CRUD.create<LiveSessionType>(req, res, "liveSession", LiveSession);
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
  await CRUD.update<LiveSessionType>(req, res, "liveSession", LiveSession);
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
    const providerFilter: FilterQuery<ProviderType>[] = [{ isEnrolled: true }];
    if (req.provider) providerFilter.push({ _id: req.provider._id });

    const approvedProviders = await Provider.find({
      $or: providerFilter,
    }).select("_id");

    const approvedCourses = await Course.find({
      provider: approvedProviders,
    }).select("_id");

    const approvedSessions = await Session.find({
      course: approvedCourses,
    }).select("_id");

    query = { session: approvedSessions, _id: req.params.id };
  }

  await CRUD.read<LiveSessionType>(req, res, "liveSession", LiveSession, query);
}

/**
 * @desc Get all live sessions
 * @route GET /api/v1/live-sessions
 * @access Public
 */
export async function getLiveSessions(req: Request, res: express.Response) {
  // TODO: search by provider id or course id

  // hide sessions that belong to unenrolled providers
  // unless the logged in user is admin or the owner of the session
  let query: FilterQuery<LiveSessionType>;

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

    const approvedSessions = await Session.find({
      course: approvedCourses,
    }).select("_id");

    query = { session: approvedSessions };
  }

  await CRUD.readAll<LiveSessionType>(
    req,
    res,
    "liveSession",
    LiveSession,
    query
  );
}

/**
 * @desc Delete a live session
 * @route DELETE /api/v1/live-sessions/:id
 * @access Restricted
 */
export async function deleteLiveSession(req: Request, res: express.Response) {
  await CRUD.del<LiveSessionType>(req, res, "liveSession", LiveSession);
}
