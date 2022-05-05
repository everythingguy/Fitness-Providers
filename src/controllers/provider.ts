import express from "express";

import Provider from "../models/provider";
import { Request, RequestBody } from "../@types/request";
import { Provider as ProviderType } from "../@types/models";
import * as CRUD from "../utils/crud";

// middleware
// attach provider to req
export async function ReqProvider(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.user) {
    try {
      const provider = await Provider.findOne({ user: req.user._id });
      if (provider) req.provider = provider;
    } catch (e) {
      req.provider = undefined;
    }
  }

  next();
}

/**
 * @desc Add Provider
 * @route POST /api/v1/providers
 * @access Restricted
 */
export async function addProvider(
  req: RequestBody<ProviderType>,
  res: express.Response
) {
  CRUD.create<ProviderType>(
    req,
    res,
    "provider",
    Provider,
    ["isEnrolled"],
    [
      {
        source: "user",
        value: "user",
      },
    ]
  );
}

/**
 * @desc Get Provider
 * @route GET /api/v1/providers/:id
 * @access Public
 */
export async function getProvider(req: Request, res: express.Response) {
  CRUD.read<ProviderType>(req, res, "provider", Provider);
}

/**
 * @desc Get Providers
 * @route GET /api/v1/providers
 * @access Public
 */
export async function getProviders(req: Request, res: express.Response) {
  CRUD.readAll<ProviderType>(req, res, "provider", Provider);
}

/**
 * @desc Delete Provider
 * @route DELETE /api/v1/providers/:id
 * @access Restricted
 */
export async function deleteProvider(req: Request, res: express.Response) {
  CRUD.del(req, res, "provider", Provider);
}

/**
 * @desc Modify Provider
 * @route PATCH /api/v1/providers/:id
 * @access Restricted
 */
export async function modifyProvider(
  req: RequestBody<ProviderType>,
  res: express.Response
) {
  CRUD.update(req, res, "provider", Provider, ["isEnrolled"]);
}
