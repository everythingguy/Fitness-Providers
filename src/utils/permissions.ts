import express from "express";
import { errorResponse } from "../@types/response";
import { Request } from "../@types/request";
import Course from "../models/course";
import Session from "../models/session";
import LiveSession from "../models/liveSession";
import { NotFoundError } from "./errors";

export function isLoggedIn(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.user) next();
  else
    res.status(401).json({
      success: false,
      error: "Please signin to gain access",
    } as errorResponse);
}

export function isLoggedInAsProvider(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.provider) next();
  else
    res.status(401).json({
      success: false,
      error: "Please signin as a provider to gain access",
    } as errorResponse);
}

export function isLoggedOut(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.user)
    res.status(400).json({
      success: false,
      error: "Please logout before logging in",
    } as errorResponse);
  else next();
}

export function isAdmin(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.user) {
    if (req.user.isAdmin) next();
    else
      res.status(401).json({
        success: false,
        error: "Only a admin can perform that action",
      } as errorResponse);
  } else
    res.status(401).json({
      success: false,
      error: "Please signin to gain access",
    } as errorResponse);
}

export function isSuperAdmin(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.user) {
    if (req.user.isSuperAdmin) next();
    else
      res.status(401).json({
        success: false,
        error: "Only a super admin can perform that action",
      } as errorResponse);
  } else
    res.status(401).json({
      success: false,
      error: "Please signin to gain access",
    } as errorResponse);
}

export function isOwnerOrAdmin(
  isOwner: (req: Request, id?: string) => Promise<boolean>,
  isPatch = false,
  id?: string,
  error?: string
) {
  return async (
    req: Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.user) {
      try {
        if (req.user.isAdmin) next();
        else if (id && req.body[id] && (await isOwner(req, req.body[id])))
          next();
        else if (id && !req.body[id] && isPatch) next();
        else if (!id && (await isOwner(req))) next();
        else if (id && req.body[id])
          res.status(401).json({
            success: false,
            error,
          });
        else
          res.status(401).json({
            success: false,
            error:
              "Only a admin or owner of the record can perform that action",
          } as errorResponse);
      } catch (error) {
        if (error.name === "NotFoundError")
          res.status(404).json({
            success: false,
            error: error.message,
          } as errorResponse);
        else if (error.name === "CastError")
          res.status(400).json({
            success: false,
            error: "Invalid ObjectId",
          } as errorResponse);
        else
          res.status(500).json({
            success: false,
            error: "Server Error",
          } as errorResponse);
      }
    } else
      res.status(401).json({
        success: false,
        error: "Please signin to gain access",
      } as errorResponse);
  };
}

export async function OwnerOfUser(
  req: Request,
  id = req.params.id
): Promise<boolean> {
  if (req.user && req.user._id.toString() === id) return true;

  return false;
}

export async function OwnerOfProvider(
  req: Request,
  id = req.params.id
): Promise<boolean> {
  if (req.provider && req.provider._id.toString() === id) return true;

  return false;
}

export async function OwnerOfCourse(
  req: Request,
  id = req.params.id
): Promise<boolean> {
  const course = await Course.findById(id);

  if (!course) throw new NotFoundError("Course not found");

  if (req.provider._id.toString() === course.provider.toString()) return true;

  return false;
}

export async function OwnerOfSession(
  req: Request,
  id = req.params.id
): Promise<boolean> {
  const session = await Session.findById(id);

  if (!session) throw new NotFoundError("Session not found");

  return OwnerOfCourse(req, session.course.toString());
}

export async function OwnerOfLiveSession(
  req: Request,
  id = req.params.id
): Promise<boolean> {
  const liveSession = LiveSession.findById(id);

  if (!liveSession) throw new NotFoundError("Live session not found");

  return OwnerOfSession(req, liveSession.session.toString());
}
