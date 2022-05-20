import express from "express";
import { Types, Model, FilterQuery, PaginateModel } from "mongoose";
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
  }[] = [],
  populate?: string[],
  succResponse: boolean = true
) {
  try {
    if (!req.user.isAdmin)
      for (const field of ignoreFields) delete req.body[field];

    for (const assumption of assumptions) {
      if (!req.body[assumption.value])
        req.body[assumption.value] =
          assumption.source === "user" ? req.user._id : req.provider._id;
    }

    let obj = new model(req.body);
    await obj.validate();
    if (succResponse) {
      obj = await obj.save();

      if (populate) for (const pop of populate) obj = await obj.populate(pop);

      res.status(201).json({
        success: true,
        data: { [modelName]: obj },
      });
    } else return obj;
  } catch (error) {
    postPatchErrorHandler(res, error);
  }

  return false;
}

export async function read<T extends Base>(
  req: Request,
  res: express.Response,
  modelName: string,
  model: Model<T>,
  query: FilterQuery<T> = { _id: req.params.id },
  populate?: string[]
) {
  try {
    let obj = await model.findOne(query);

    if (populate) for (const pop of populate) obj = await obj.populate(pop);

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

type Populate = {
  path: string;
  populate?: {
    path: string;
    model: string;
    populate?: Populate & { model: string };
  };
};

export async function readAll<T extends Base>(
  req: Request,
  res: express.Response,
  modelName: string,
  model: PaginateModel<T, {}, {}>,
  query: FilterQuery<T> = {},
  plural?: string,
  populate?: string[] | Populate[]
) {
  const pageLimit = 50;
  let page = 1;
  const sort = req.query.sort ? req.query.sort : "-createdAt";

  try {
    page = Math.max(1, parseInt(req.query.page as string, 10));
    if (isNaN(page)) throw new Error();
  } catch (e) {
    page = 1;
  }

  try {
    const objs = await model.paginate(query, {
      page,
      limit: pageLimit,
      sort,
      populate,
    });

    let resJSON: any = {
      success: true,
      data: { [plural ? plural : `${modelName}s`]: objs.docs },
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
  ignoreFields: (keyof T)[] = [],
  populate?: string[],
  succResponse: boolean = true
) {
  if (!req.user.isAdmin) {
    delete req.body._id;
    for (const field of ignoreFields) delete req.body[field];
  }
  try {
    await model.findByIdAndUpdate(req.params.id, req.body as any, {
      runValidators: true,
    });

    let obj = await model.findById(req.params.id);
    if (populate) for (const pop of populate) obj = await obj.populate(pop);

    if (!obj) {
      res.status(404).json({
        success: false,
        error: `${modelName} not found`,
      } as errorResponse);
      return false;
    }

    if (succResponse)
      res.status(200).json({
        success: true,
        data: { [modelName]: obj },
      });
    else return obj;
  } catch (error) {
    postPatchErrorHandler(res, error);
  }

  return false;
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

    await obj.remove();

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
