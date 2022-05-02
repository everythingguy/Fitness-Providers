import express from "express";

import Provider from "../models/provider";
import { postPatchErrorHandler } from "../utils/errors";
import { ProviderRequest } from "../@types/request";
import {
  errorResponse,
  providerResponse,
  providersResponse,
} from "../@types/response";
import { Request } from "../@types/request";

/**
 * @desc Add Provider
 * @route POST /api/v1/provider
 * @access Restricted
 */
export async function addProvider(req: ProviderRequest, res: express.Response) {
  if (!req.user.isAdmin) {
    delete req.body.isEnrolled;
    req.body.user = req.user._id;
  }
  try {
    const provider = await Provider.create(req.body);
    res.status(201).json({
      success: true,
      data: { provider },
    } as providerResponse);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

/**
 * @desc Get Provider
 * @route GET /api/v1/provider/:id
 * @access Public
 */
export async function getProvider(req: Request, res: express.Response) {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider)
      return res.status(404).json({
        success: false,
        error: "No provider found by that id",
      } as errorResponse);

    return res.status(200).json({
      success: true,
      data: { provider },
    } as providerResponse);
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    } as errorResponse);
  }
}

/**
 * @desc Get Providers
 * @route GET /api/v1/provider
 * @access Public
 */
export async function getProviders(req: Request, res: express.Response) {
  try {
    const providers = await Provider.find({});
    return res.status(200).json({
      success: true,
      data: { providers },
    } as providersResponse);
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Delete Provider
 * @route DELETE /api/v1/provider/:id
 * @access Restricted
 */
export async function deleteProvider(req: Request, res: express.Response) {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider)
      return res.status(404).json({
        success: false,
        error: "No provider found by that id",
      } as errorResponse);

    await Provider.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      data: { provider },
    } as providerResponse);
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Modify Provider
 * @route PATCH /api/v1/provider/:id
 * @access Restricted
 */
export async function modifyProvider(
  req: ProviderRequest,
  res: express.Response
) {
  if (!req.user.isAdmin) {
    delete req.body.isEnrolled;
    req.body.user = req.user._id;
  }
  try {
    const provider = await Provider.create(req.body);
    res.status(200).json({
      success: true,
      data: { provider },
    } as providerResponse);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}
