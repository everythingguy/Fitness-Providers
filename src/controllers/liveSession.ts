import express from "express";

import LiveSession from "../models/liveSession";
import { Request, RequestBody } from "../@types/request";
import { LiveSession as LiveSessionType } from "../@types/models";
import * as CRUD from "../utils/crud";

/**
 * @desc Add a live session to a session
 * @route POST /api/v1/live-sessions
 * @access Restricted
 */
export async function addLiveSession(
  req: RequestBody<LiveSessionType>,
  res: express.Response
) {
  CRUD.create<LiveSessionType>(req, res, "liveSession", LiveSession);
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
  CRUD.update<LiveSessionType>(req, res, "liveSession", LiveSession);
}

/**
 * @desc Get a live session by id
 * @route GET /api/v1/live-sessions/:id
 * @access Public
 */
export async function getLiveSession(req: Request, res: express.Response) {
  // TODO: hide sessions that belong to unenrolled providers
  // unless the logged in user is admin or the owner of the session
  CRUD.read<LiveSessionType>(req, res, "liveSession", LiveSession);
}

/**
 * @desc Get all live sessions
 * @route GET /api/v1/live-sessions
 * @access Public
 */
export async function getLiveSessions(req: Request, res: express.Response) {
  // TODO: hide sessions that belong to unenrolled providers
  // unless the logged in user is admin or the owner of the session
  CRUD.readAll<LiveSessionType>(req, res, "liveSession", LiveSession);
}

/**
 * @desc Delete a live session
 * @route DELETE /api/v1/live-sessions/:id
 * @access Restricted
 */
export async function deleteLiveSession(req: Request, res: express.Response) {
  CRUD.del<LiveSessionType>(req, res, "liveSession", LiveSession);
}
