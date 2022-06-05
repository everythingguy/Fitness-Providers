import express from "express";
import {
    Types,
    Model,
    FilterQuery,
    PaginateModel,
    PaginateResult,
    HydratedDocument
} from "mongoose";
import { postPatchErrorHandler, ValidationError } from "./errors";
import { Base } from "../@types/models";
import { Request, RequestBody } from "../@types/request";
import { errorResponse } from "../@types/response";
import { KeysOfMultiType } from "../@types/misc";

type Populate = {
    path: string;
    select?: string;
    populate?:
        | {
              path: string;
              model: string;
              select?: string;
              populate?:
                  | (Populate & { model: string })[]
                  | (Populate & { model: string });
          }[]
        | {
              path: string;
              model: string;
              select?: string;
              populate?:
                  | (Populate & { model: string })[]
                  | (Populate & { model: string });
          };
};

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
    populate?: string[] | Populate[] | Populate,
    succResponse = true
) {
    try {
        if (!req.user.isAdmin)
            for (const field of ignoreFields) delete req.body[field];

        for (const assumption of assumptions) {
            if (!req.body[assumption.value])
                req.body[assumption.value] =
                    assumption.source === "user"
                        ? req.user._id
                        : req.provider._id;
        }

        let obj = new model(req.body);
        await obj.validate();
        if (succResponse) {
            obj = await obj.save();

            if (populate) obj = await obj.populate(populate);

            res.status(201).json({
                success: true,
                data: { [modelName]: obj }
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
    populate?: string[] | Populate[] | Populate
) {
    try {
        let obj = await model.findOne(query);

        if (populate) obj = await obj.populate(populate);

        if (!obj)
            return res.status(404).json({
                success: false,
                error: `No ${modelName} found by that id`
            } as errorResponse);

        return res.status(200).json({
            success: true,
            data: { [modelName]: obj }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: "Invalid ObjectId"
        } as errorResponse);
    }
}

export async function readAll<T extends Base>(
    req: Request,
    res: express.Response,
    modelName: string,
    model: PaginateModel<T, unknown, unknown>,
    query: FilterQuery<T> = {},
    plural?: string,
    populate?: string[] | Populate[] | Populate,
    aggregate = false,
    sort = true
) {
    const pageLimit = 50;
    let page = 1;
    const sortOption = req.query.sort
        ? (req.query.sort as string)
        : "-createdAt";

    try {
        page = Math.max(1, parseInt(req.query.page as string, 10));
        if (isNaN(page)) throw new Error();
    } catch (e) {
        page = 1;
    }

    try {
        const options = {
            page,
            limit: pageLimit,
            sort: sortOption,
            populate
        };

        let objs: PaginateResult<
            HydratedDocument<
                T,
                unknown,
                {
                    page: number;
                    limit: number;
                    sort: any;
                    populate: string[] | Populate | Populate[];
                }
            >
        >;

        if (aggregate) {
            if (!sort) delete options.sort;

            objs = await (model as any).aggregatePaginate(
                model.aggregate(query as any),
                options
            );
        } else objs = await model.paginate(query, options);

        let resJSON: any = {
            success: true,
            data: { [plural ? plural : `${modelName}s`]: objs.docs }
        };
        resJSON = { ...objs, ...resJSON };
        delete resJSON.docs;

        return res.status(200).json(resJSON);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Server Error"
        } as errorResponse);
    }
}

type updateType = Base & {
    image?: string | null;
};

export async function update<T extends updateType>(
    req: RequestBody<T>,
    res: express.Response,
    modelName: string,
    model: Model<T>,
    ignoreFields: (keyof T)[] = [],
    populate?: string[] | Populate[] | Populate,
    succResponse = true,
    select?: string
) {
    ignoreFields.push("createdAt");
    ignoreFields.push("updatedAt");
    ignoreFields.push("__v");
    ignoreFields.push("_id");

    if (!req.user.isAdmin) {
        delete req.body._id;
        for (const field of ignoreFields) delete req.body[field];
    }
    try {
        if ("image" in req.body && req.body.image !== null) {
            const errorMsg =
                "You can only patch image to null at this endpoint";
            throw new ValidationError(errorMsg, {
                image: new Error(errorMsg)
            });
        }
        await model.updateOne({ _id: req.params.id }, req.body as any, {
            runValidators: true
        });

        let obj = select
            ? await model.findById(req.params.id).select(select)
            : await model.findById(req.params.id);
        if (populate) obj = await obj.populate(populate);

        if (!obj) {
            res.status(404).json({
                success: false,
                error: `${modelName} not found`
            } as errorResponse);
            return false;
        }

        if (succResponse)
            res.status(200).json({
                success: true,
                data: { [modelName]: obj }
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
    model: Model<T>,
    populate?: string[] | Populate[] | Populate,
    succResponse = true
) {
    try {
        let obj = await model.findById(req.params.id);

        if (!obj)
            return res.status(404).json({
                success: false,
                error: `No ${modelName} found by that id`
            } as errorResponse);

        if (populate) obj = await obj.populate(populate);

        await obj.remove();

        if (succResponse)
            return res.status(200).json({
                success: true,
                data: { [modelName]: obj }
            });
        else return obj;
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                error: "Invalid ObjectId"
            } as errorResponse);
        }

        return res.status(500).json({
            success: false,
            error: "Server Error"
        } as errorResponse);
    }
}
