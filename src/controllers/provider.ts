import express from "express";

import Provider from "../models/provider";
import Address from "../models/address";
import { Request, RequestBody } from "../@types/request";
import {
  Address as AddressType,
  Provider as ProviderType,
} from "../@types/models";
import * as CRUD from "../utils/crud";
import { FilterQuery, Types } from "mongoose";
import { filterTags } from "../utils/filter";
import { postPatchErrorHandler } from "../utils/errors";
import { errorResponse } from "./../@types/response.d";

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
  if (req.body.address) {
    const address = req.body.address as AddressType;

    let provider = await CRUD.create<ProviderType>(
      req,
      res,
      "provider",
      Provider,
      ["isEnrolled", "image", "address"],
      [
        {
          source: "user",
          value: "user",
        },
      ],
      undefined,
      false
    );

    req.provider = provider;
    req.body = address as any;

    const addr = await CRUD.create<AddressType>(
      req,
      res,
      "address",
      Address,
      ["provider"],
      [
        {
          source: "provider",
          value: "provider",
        },
      ],
      undefined,
      false
    );

    try {
      provider.address = addr._id;
      await provider.validate();
      provider = await provider.save();

      provider = await provider.populate("address");

      res.status(201).json({
        success: true,
        data: { provider },
      });
    } catch (error) {
      postPatchErrorHandler(res, error);
    }
  } else {
    await CRUD.create<ProviderType>(
      req,
      res,
      "provider",
      Provider,
      ["isEnrolled", "image", "address"],
      [
        {
          source: "user",
          value: "user",
        },
      ]
    );
  }
}

/**
 * @desc Get Provider
 * @route GET /api/v1/providers/:id
 * @access Public
 */
export async function getProvider(req: Request, res: express.Response) {
  // hide providers that are not enrolled
  // unless logged in user is admin or the provider they are looking for
  const query: FilterQuery<ProviderType>[] = [
    { isEnrolled: true, _id: req.params.id },
  ];
  if (req.user) query.push({ user: req.user._id, _id: req.params.id });
  if (req.user && req.user.isAdmin) query.push({ _id: req.params.id });

  await CRUD.read<ProviderType>(
    req,
    res,
    "provider",
    Provider,
    {
      $or: query,
    },
    ["address"]
  );
}

/**
 * @desc Get Providers
 * @route GET /api/v1/providers
 * @access Public
 */
export async function getProviders(req: Request, res: express.Response) {
  // filter based on tags
  const tagFilter: Types.ObjectId[] = filterTags(req);

  // hide providers that are not enrolled
  // unless logged in user is admin or the provider
  const query: FilterQuery<ProviderType>[] = [
    { isEnrolled: true, tags: tagFilter },
  ];
  if (req.provider) query.push({ _id: req.provider._id, tags: tagFilter });
  if (req.user && req.user.isAdmin) query.push({ tags: tagFilter });

  await CRUD.readAll<ProviderType>(
    req,
    res,
    "provider",
    Provider,
    {
      $or: query,
    },
    undefined,
    ["address"]
  );
}

/**
 * @desc Delete Provider
 * @route DELETE /api/v1/providers/:id
 * @access Restricted
 */
export async function deleteProvider(req: Request, res: express.Response) {
  await CRUD.del(req, res, "provider", Provider);
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
  if (req.body.address) {
    const address = req.body.address;

    let provider: any = await CRUD.update(
      req,
      res,
      "provider",
      Provider,
      ["isEnrolled", "image", "address"],
      undefined,
      false
    );

    req.body = address as any;

    await CRUD.update(
      req as unknown as RequestBody<AddressType>,
      res,
      "address",
      Address,
      ["provider"],
      undefined,
      false
    );

    try {
      provider = await (
        await Provider.findById(provider._id)
      ).populate("address");

      res.status(201).json({
        success: true,
        data: { provider },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Server Error",
      } as errorResponse);
    }
  } else {
    await CRUD.update(req, res, "provider", Provider, [
      "isEnrolled",
      "image",
      "address",
    ]);
  }
}
