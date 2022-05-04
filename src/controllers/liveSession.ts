import express from "express";

import LiveSession from "../models/liveSession";
import { postPatchErrorHandler } from "../utils/errors";
import { LiveSessionRequest } from "../@types/request";
import {
  liveSessionResponse,
  liveSessionsResponse,
  errorResponse,
} from "../@types/response";
import { Request } from "../@types/request";

/**
 * @desc Add a live session to a session
 * @route POST /api/v1/live-sessions
 * @access Restricted
 */
export async function addLiveSession(
  req: LiveSessionRequest,
  res: express.Response
) {
  try {
    const liveSession = await LiveSession.create(req.body);
    res.status(201).json({
      success: true,
      data: { liveSession },
    } as liveSessionResponse);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

/**
 * @desc Modify a live session
 * @route PATCH /api/v1/live-sessions/:id
 * @access Restricted
 */
export async function modifyLiveSession(
  req: LiveSessionRequest,
  res: express.Response
) {
  if (!req.user.isAdmin) {
    delete req.body._id;
  }
  try {
    await LiveSession.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    const liveSession = await LiveSession.findById(req.params.id);

    if (!liveSession) {
      return res.status(404).json({
        success: false,
        error: "Live session not found",
      } as errorResponse);
    }

    res.status(200).json({
      success: true,
      data: { liveSession },
    } as liveSessionResponse);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

/**
 * @desc Get a live session by id
 * @route GET /api/v1/live-sessions/:id
 * @access Public
 */
export async function getLiveSession(req: Request, res: express.Response) {
  try {
    const liveSession = await LiveSession.findById(req.params.id);

    if (!liveSession)
      return res.status(404).json({
        success: false,
        error: "No live session found by that id",
      } as errorResponse);

    return res.status(200).json({
      success: true,
      data: { liveSession },
    } as liveSessionResponse);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid ObjectId",
    } as errorResponse);
  }
}

/**
 * @desc Get all live sessions
 * @route GET /api/v1/live-sessions
 * @access Public
 */
export async function getLiveSessions(req: Request, res: express.Response) {
  try {
    const liveSessions = await LiveSession.find({});
    return res.status(200).json({
      success: true,
      data: { liveSessions },
    } as liveSessionsResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Delete a live session
 * @route DELETE /api/v1/live-sessions/:id
 * @access Restricted
 */
export async function deleteLiveSession(req: Request, res: express.Response) {
  try {
    const liveSession = await LiveSession.findById(req.params.id);

    if (!liveSession)
      return res.status(404).json({
        success: false,
        error: "No live session found by that id",
      } as errorResponse);

    await LiveSession.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      data: { liveSession },
    } as liveSessionResponse);
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
