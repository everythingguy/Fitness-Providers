import express from "express";

import Provider from "../models/provider";
import { postPatchErrorHandler } from "../utils/errors";
import {
  errorResponse,
  providerResponse,
  providersResponse,
} from "../@types/response";
import { Request, RequestBody } from "../@types/request";
import { Provider as ProviderType } from "../@types/models";
import * as Crud from "../utils/crud";

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
  Crud.create<ProviderType>(
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
  Crud.read<ProviderType>(req, res, "provider", Provider);
}

/**
 * @desc Get Providers
 * @route GET /api/v1/providers
 * @access Public
 */
export async function getProviders(req: Request, res: express.Response) {
  Crud.readAll<ProviderType>(req, res, "provider", Provider);
}

/**
 * @desc Delete Provider
 * @route DELETE /api/v1/providers/:id
 * @access Restricted
 */
export async function deleteProvider(req: Request, res: express.Response) {
  Crud.del(req, res, "provider", Provider);
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
  Crud.update(req, res, "provider", Provider, ["isEnrolled"]);
}
