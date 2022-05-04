import express from "express";

import Course from "../models/course";
import { postPatchErrorHandler } from "../utils/errors";
import { CourseRequest } from "../@types/request";
import {
  courseResponse,
  coursesResponse,
  errorResponse,
} from "../@types/response";
import { Request } from "../@types/request";

/**
 * @desc Add a course to a provider
 * @route POST /api/v1/courses
 * @access Restricted
 */
export async function addCourse(req: CourseRequest, res: express.Response) {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({
      success: true,
      data: { course },
    } as courseResponse);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

/**
 * @desc Modify a course
 * @route PATCH /api/v1/courses/:id
 * @access Restricted
 */
export async function modifyCourse(req: CourseRequest, res: express.Response) {
  if (!req.user.isAdmin) {
    delete req.body._id;
  }
  try {
    await Course.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      } as errorResponse);
    }

    res.status(200).json({
      success: true,
      data: { course },
    } as courseResponse);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

/**
 * @desc Get a course by id
 * @route GET /api/v1/courses/:id
 * @access Public
 */
export async function getCourse(req: Request, res: express.Response) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course)
      return res.status(404).json({
        success: false,
        error: "No course found by that id",
      } as errorResponse);

    return res.status(200).json({
      success: true,
      data: { course },
    } as courseResponse);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid ObjectId",
    } as errorResponse);
  }
}

/**
 * @desc Get all courses
 * @route GET /api/v1/courses
 * @access Public
 */
export async function getCourses(req: Request, res: express.Response) {
  try {
    const courses = await Course.find({});
    return res.status(200).json({
      success: true,
      data: { courses },
    } as coursesResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Delete a course
 * @route DELETE /api/v1/courses/:id
 * @access Restricted
 */
export async function deleteCourse(req: Request, res: express.Response) {
  try {
    const course = await Course.findById(req.params.id);

    if (!course)
      return res.status(404).json({
        success: false,
        error: "No course found by that id",
      } as errorResponse);

    await Course.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      success: true,
      data: { course },
    } as courseResponse);
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
