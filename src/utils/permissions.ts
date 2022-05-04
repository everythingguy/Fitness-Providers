import express from "express";
import { errorResponse } from "../@types/response";
import { Request } from "../@types/request";
import Provider from "../models/provider";
import Course from "../models/course";
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
  if (req.user) {
    res.status(400).json({
      success: false,
      error: "Please logout before logging in",
    } as errorResponse);
  } else next();
}

export function isAdmin(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.user) {
    if (req.user.isAdmin) next();
    else {
      res.status(401).json({
        success: false,
        error: "Only a admin can perform that action",
      } as errorResponse);
    }
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
    else {
      res.status(401).json({
        success: false,
        error: "Only a super admin can perform that action",
      } as errorResponse);
    }
  } else
    res.status(401).json({
      success: false,
      error: "Please signin to gain access",
    } as errorResponse);
}

export function isOwnerOrAdmin(isOwner: (req: Request) => Promise<boolean>) {
  return async (
    req: Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.user) {
      try {
        if (req.user.isAdmin) next();
        else if (await isOwner(req)) next();
        else {
          res.status(401).json({
            success: false,
            error:
              "Only a admin or owner of the record can perform that action",
          } as errorResponse);
        }
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

export async function OwnerOfProvider(req: Request): Promise<boolean> {
  if (req.provider && req.provider._id.toString() === req.params.id) {
    return true;
  }

  return false;
}

export async function OwnerOfCourse(req: Request): Promise<boolean> {
  const course = await Course.findById(req.params.id);

  if (!course) throw new NotFoundError("Course not found");

  if (req.provider._id.toString() === course.provider._id.toString())
    return true;

  return false;
}
