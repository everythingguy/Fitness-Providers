import express from "express";
import { Types, Model } from "mongoose";
import { postPatchErrorHandler } from "./errors";
import { Base, Provider, User } from "../@types/models";
import { Request, RequestBody } from "../@types/request";
import { errorResponse } from "../@types/response";
import { KeysOfMultiType } from "../@types/misc";

export async function create<T extends Base>(
  req: RequestBody<any>, // for some reason I had to set to any instead of T
  res: express.Response,
  modelName: string,
  model: Model<T>,
  ignoreFields: (keyof T)[] = [],
  assumptions: {
    value: KeysOfMultiType<T, Types.ObjectId>;
    source: "user" | "provider";
  }[] = []
) {
  try {
    if (!req.user.isAdmin)
      for (const field of ignoreFields) delete req.body[field];

    for (const assumption of assumptions) {
      if (!req.body[assumption.value])
        req.body[assumption.value] =
          assumption.source === "user" ? req.user._id : req.provider._id;
    }

    const obj = await model.create(req.body);
    res.status(201).json({
      success: true,
      data: { [modelName]: obj },
    });
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

export async function read<T extends Base>(
  req: Request,
  res: express.Response,
  modelName: string,
  model: Model<T>
) {
  try {
    const obj = await model.findById(req.params.id);

    if (!obj)
      return res.status(404).json({
        success: false,
        error: `No ${modelName} found by that id`,
      } as errorResponse);

    return res.status(200).json({
      success: true,
      data: { [modelName]: obj },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid ObjectId",
    } as errorResponse);
  }
}

export async function readAll<T extends Base>(
  req: Request,
  res: express.Response,
  modelName: string,
  model: Model<T>
) {
  try {
    const objs = await model.find({});
    return res.status(200).json({
      success: true,
      data: { [`${modelName}s`]: objs },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

export async function update<T extends Base>(
  req: RequestBody<T>,
  res: express.Response,
  modelName: string,
  model: Model<T>,
  ignoreFields: (keyof T)[] = []
) {
  if (!req.user.isAdmin) {
    delete req.body._id;
    for (const field of ignoreFields) delete req.body[field];
  }
  try {
    await model.updateOne({ _id: req.params.id }, req.body as any, {
      runValidators: true,
    });

    const obj = await model.findById(req.params.id);

    if (!obj) {
      return res.status(404).json({
        success: false,
        error: `${modelName} not found`,
      } as errorResponse);
    }

    res.status(200).json({
      success: true,
      data: { [modelName]: obj },
    });
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

export async function del<T extends Base>(
  req: Request,
  res: express.Response,
  modelName: string,
  model: Model<T>
) {
  try {
    const obj = await model.findById(req.params.id);

    if (!obj)
      return res.status(404).json({
        success: false,
        error: `No ${modelName} found by that id`,
      } as errorResponse);

    await model.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      data: { [modelName]: obj },
    });
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
