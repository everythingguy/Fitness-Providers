import express from "express";
import {
  Types,
  Model,
  FilterQuery,
  HydratedDocument,
  PaginateModel,
  PaginateResult,
} from "mongoose";
import { postPatchErrorHandler } from "./errors";
import { Base } from "../@types/models";
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
  model: Model<T>,
  query: FilterQuery<T> = { _id: req.params.id }
) {
  try {
    const obj = await model.findOne(query);

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
  model: PaginateModel<T, {}, {}>,
  query: FilterQuery<T> = {}
) {
  const pageLimit = 50;
  let page = 1;
  const sort = req.query.sort ? req.query.sort : "-createdAt";

  try {
    page = Math.max(1, parseInt(req.query.page as any, 10));
    if (isNaN(page)) throw new Error();
  } catch (e) {
    page = 1;
  }

  try {
    const objs = await model.paginate(query, {
      page,
      limit: pageLimit,
      sort,
    });

    let resJSON: any = {
      success: true,
      data: { [`${modelName}s`]: objs.docs },
    };
    resJSON = { ...objs, ...resJSON };
    delete resJSON.docs;

    return res.status(200).json(resJSON);
  } catch (error) {
    // tslint:disable-next-line: no-console
    console.log(error);
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
    await model.findByIdAndUpdate(req.params.id, req.body as any, {
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

    await model.findByIdAndDelete(req.params.id);

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
