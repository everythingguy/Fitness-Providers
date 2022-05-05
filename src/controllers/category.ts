import express from "express";

import Category from "../models/category";
import { Request, RequestBody } from "../@types/request";
import { Category as CategoryType } from "../@types/models";
import * as CRUD from "../utils/crud";

/**
 * @desc Add Category
 * @route POST /api/v1/categories
 * @access Restricted
 */
export async function addCategory(
  req: RequestBody<CategoryType>,
  res: express.Response
) {
  CRUD.create<CategoryType>(req, res, "category", Category);
}

/**
 * @desc Get Category
 * @route GET /api/v1/categories/:id
 * @access Public
 */
export async function getCategory(req: Request, res: express.Response) {
  CRUD.read<CategoryType>(req, res, "category", Category);
}

/**
 * @desc Get Categories
 * @route GET /api/v1/categories
 * @access Public
 */
export async function getCategories(req: Request, res: express.Response) {
  CRUD.readAll<CategoryType>(req, res, "category", Category);
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
  CRUD.update<CategoryType>(req, res, "category", Category);
}

/**
 * @desc DELETE Category
 * @route DELETE /api/v1/categories/:id
 * @access Restricted
 */
export async function deleteCategory(req: Request, res: express.Response) {
  CRUD.del<CategoryType>(req, res, "category", Category);
}
