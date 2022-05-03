import express from "express";
import { errorResponse } from "../@types/response";
import { Request } from "../@types/request";
import Provider from "../models/provider";

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
      if (req.user.isAdmin) next();
      else if (await isOwner(req)) next();
      else {
        res.status(401).json({
          success: false,
          error: "Only a admin or owner of the record can perform that action",
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
  try {
    const provider = await Provider.findById(req.params.id);
    console.log({
      provider: provider.user,
      user: req.user,
    });

    return true;

    if (provider && provider.user === req.user._id) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}
