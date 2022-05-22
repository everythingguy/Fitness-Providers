import express from "express";

import Category from "../models/category";
import { Request, RequestBody } from "../@types/request";
import { Category as CategoryType } from "../@types/models";
import * as CRUD from "../utils/crud";
import { errorResponse } from "../@types/response";

// WARNING GET ALL is not using the variable
const populate = { path: "tags" };

/**
 * @desc Add Category
 * @route POST /api/v1/categories
 * @access Restricted
 */
export async function addCategory(
    req: RequestBody<CategoryType>,
    res: express.Response
) {
    await CRUD.create<CategoryType>(
        req,
        res,
        "category",
        Category,
        undefined,
        undefined,
        populate
    );
}

/**
 * @desc Get Category
 * @route GET /api/v1/categories/:id
 * @access Public
 */
export async function getCategory(req: Request, res: express.Response) {
    await CRUD.read<CategoryType>(
        req,
        res,
        "category",
        Category,
        undefined,
        populate
    );
}

/**
 * @desc Get Categories
 * @route GET /api/v1/categories
 * @access Public
 */
export async function getCategories(req: Request, res: express.Response) {
    try {
        const {
            appliesToProvider,
            appliesToCourse
        }: { appliesToProvider?: string; appliesToCourse?: string } = req.query;

        const filter: [{ $eq: (string | boolean)[] }] = [
            { $eq: ["$$categoryID", "$category"] }
        ];

        if (appliesToProvider)
            filter.push({
                $eq: [
                    "$appliesToProvider",
                    appliesToProvider.toLowerCase() === "true"
                ]
            });

        if (appliesToCourse)
            filter.push({
                $eq: [
                    "$appliesToCourse",
                    appliesToCourse.toLowerCase() === "true"
                ]
            });

        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: "tags",
                    // localField: "_id",
                    // foreignField: "category",
                    let: { categoryID: "$_id" },
                    as: "tags",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: filter
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Server Error"
        } as errorResponse);
    }
}

/**
 * @desc Modify Category
 * @route PATCH /api/v1/categories/:id
 * @access Restricted
 */
export async function modifyCategory(
    req: RequestBody<CategoryType>,
    res: express.Response
) {
    await CRUD.update<CategoryType>(
        req,
        res,
        "category",
        Category,
        undefined,
        populate
    );
}

/**
 * @desc DELETE Category
 * @route DELETE /api/v1/categories/:id
 * @access Restricted
 */
export async function deleteCategory(req: Request, res: express.Response) {
    await CRUD.del<CategoryType>(req, res, "category", Category, populate);
}
