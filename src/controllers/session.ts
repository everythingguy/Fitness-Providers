import express from "express";

import Session from "../models/session";
import { postPatchErrorHandler } from "../utils/errors";
import {
  sessionResponse,
  sessionsResponse,
  errorResponse,
} from "../@types/response";
import { Request, RequestBody } from "../@types/request";
import { Session as SessionType } from "../@types/models";

/**
 * @desc Add a session to a course
 * @route POST /api/v1/sessions
 * @access Restricted
 */
export async function addSession(
  req: RequestBody<SessionType>,
  res: express.Response
) {
  try {
    const session = await Session.create(req.body);
    res.status(201).json({
      success: true,
      data: { session },
    } as sessionResponse);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
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
  if (!req.user.isAdmin) {
    delete req.body._id;
  }
  try {
    await Session.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      } as errorResponse);
    }

    res.status(200).json({
      success: true,
      data: { session },
    } as sessionResponse);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

/**
 * @desc Get a session by id
 * @route GET /api/v1/sessions/:id
 * @access Public
 */
export async function getSession(req: Request, res: express.Response) {
  try {
    const session = await Session.findById(req.params.id);

    if (!session)
      return res.status(404).json({
        success: false,
        error: "No session found by that id",
      } as errorResponse);

    return res.status(200).json({
      success: true,
      data: { session },
    } as sessionResponse);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid ObjectId",
    } as errorResponse);
  }
}

/**
 * @desc Get all sessions
 * @route GET /api/v1/sessions
 * @access Public
 */
export async function getSessions(req: Request, res: express.Response) {
  try {
    const sessions = await Session.find({});
    return res.status(200).json({
      success: true,
      data: { sessions },
    } as sessionsResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Delete a session
 * @route DELETE /api/v1/sessions/:id
 * @access Restricted
 */
export async function deleteSession(req: Request, res: express.Response) {
  try {
    const session = await Session.findById(req.params.id);

    if (!session)
      return res.status(404).json({
        success: false,
        error: "No session found by that id",
      } as errorResponse);

    await Session.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      data: { session },
    } as sessionResponse);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid ObjectId",
      } as errorResponse);
    }

    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}
