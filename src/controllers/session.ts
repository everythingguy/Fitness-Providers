import express from "express";

import Session from "../models/session";
import { Request, RequestBody } from "../@types/request";
import { Session as SessionType } from "../@types/models";
import * as CRUD from "../utils/crud";

/**
 * @desc Add a session to a course
 * @route POST /api/v1/sessions
 * @access Restricted
 */
export async function addSession(
  req: RequestBody<SessionType>,
  res: express.Response
) {
  CRUD.create(req, res, "session", Session);
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
  CRUD.update(req, res, "session", Session);
}

/**
 * @desc Get a session by id
 * @route GET /api/v1/sessions/:id
 * @access Public
 */
export async function getSession(req: Request, res: express.Response) {
  CRUD.read(req, res, "session", Session);
}

/**
 * @desc Get all sessions
 * @route GET /api/v1/sessions
 * @access Public
 */
export async function getSessions(req: Request, res: express.Response) {
  CRUD.readAll(req, res, "session", Session);
}

/**
 * @desc Delete a session
 * @route DELETE /api/v1/sessions/:id
 * @access Restricted
 */
export async function deleteSession(req: Request, res: express.Response) {
  CRUD.del(req, res, "session", Session);
}
