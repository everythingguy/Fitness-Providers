import express from "express";

import Course from "../models/course";
import { Request, RequestBody } from "../@types/request";
import { Course as CourseType } from "../@types/models";
import * as CRUD from "../utils/crud";

/**
 * @desc Add a course to a provider
 * @route POST /api/v1/courses
 * @access Restricted
 */
export async function addCourse(
  req: RequestBody<CourseType>,
  res: express.Response
) {
  CRUD.create<CourseType>(
    req,
    res,
    "course",
    Course,
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
 * @desc Modify a course
 * @route PATCH /api/v1/courses/:id
 * @access Restricted
 */
export async function modifyCourse(
  req: RequestBody<CourseType>,
  res: express.Response
) {
  CRUD.update<CourseType>(req, res, "course", Course);
}

/**
 * @desc Get a course by id
 * @route GET /api/v1/courses/:id
 * @access Public
 */
export async function getCourse(req: Request, res: express.Response) {
  // TODO: hide courses that belong to unenrolled providers
  // unless the logged in user is admin or the owner of the course
  CRUD.read<CourseType>(req, res, "course", Course);
}

/**
 * @desc Get all courses
 * @route GET /api/v1/courses
 * @access Public
 */
export async function getCourses(req: Request, res: express.Response) {
  // TODO: hide courses that belong to unenrolled providers
  // unless the logged in user is admin or the owner of the course
  CRUD.readAll(req, res, "course", Course);
}

/**
 * @desc Delete a course
 * @route DELETE /api/v1/courses/:id
 * @access Restricted
 */
export async function deleteCourse(req: Request, res: express.Response) {
  CRUD.del(req, res, "course", Course);
}
