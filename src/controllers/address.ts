import express from "express";

import Address from "../models/address";
import Provider from "../models/provider";
import { Request, RequestBody } from "../@types/request";
import {
  Address as AddressType,
  Provider as ProviderType,
} from "../@types/models";
import * as CRUD from "../utils/crud";
import { FilterQuery } from "mongoose";

/**
 * @desc Add Address
 * @route POST /api/v1/adresses
 * @access Restricted
 */
export async function addAddress(
  req: RequestBody<AddressType>,
  res: express.Response
) {
  await CRUD.create<AddressType>(
    req,
    res,
    "address",
    Address,
    [],
    [
      {
        source: "provider",
        value: "provider",
      },
    ]
  );
}

/**
 * @desc Get Address
 * @route GET /api/v1/addresses/:id
 * @access Public
 */
export async function getAddress(req: Request, res: express.Response) {
  // hide addresses of providers that are not enrolled
  // unless logged in user is admin or the provider that owns the address
  const providerFilter: FilterQuery<ProviderType>[] = [{ isEnrolled: true }];
  if (req.provider) providerFilter.push({ _id: req.provider._id });

  const approvedProviders = await Provider.find({ $or: providerFilter }).select(
    "_id"
  );

  let query: FilterQuery<AddressType> = {
    provider: approvedProviders,
    _id: req.params.id,
  };
  if (req.user && req.user.isAdmin) query = { _id: req.params.id };

  await CRUD.read<AddressType>(req, res, "address", Address, query, [
    "provider",
  ]);
}

/**
 * @desc Get Addresses
 * @route GET /api/v1/addresses
 * @access Public
 */
export async function getAddresses(req: Request, res: express.Response) {
  // hide addresses of providers that are not enrolled
  // unless logged in user is admin or the provider that owns the address
  let query: FilterQuery<AddressType>;

  if (req.user && req.user.isAdmin)
    query = { provider: req.query.provider ? req.query.provider : undefined };
  else {
    const providerFilter: FilterQuery<ProviderType>[] = [{ isEnrolled: true }];
    if (req.provider) providerFilter.push({ _id: req.provider._id });

    const approvedProviders = await Provider.find({
      $or: providerFilter,
    }).select("_id");

    if (req.query.provider)
      query = {
        $and: [
          { provider: approvedProviders },
          { provider: req.query.provider },
        ],
      };
    else query = { provider: approvedProviders };
  }

  await CRUD.readAll<AddressType>(
    req,
    res,
    "address",
    Address,
    query,
    "addresses",
    ["provider"]
  );
}

/**
 * @desc Delete Address
 * @route DELETE /api/v1/addresses/:id
 * @access Restricted
 */
export async function deleteAddress(req: Request, res: express.Response) {
  await CRUD.del(req, res, "address", Address);
}

/**
 * @desc Modify Address
 * @route PATCH /api/v1/addresses/:id
 * @access Restricted
 */
export async function modifyAddress(
  req: RequestBody<AddressType>,
  res: express.Response
) {
  await CRUD.update(req, res, "address", Address, undefined, ["provider"]);
}
