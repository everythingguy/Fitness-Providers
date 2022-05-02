import mongoose from "mongoose";
import express from "express";
import { errorResponse } from "../@types/response";

export class UniqueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UniqueError";
  }
}

export function parseValidationErrors(error: any) {
  const errors: any = {};
  for (const err in error.errors) {
    if (error.errors.hasOwnProperty(err))
      errors[err] = error.errors[err].message;
  }
  return errors;
}

export function UniqueErrorRaiser(
  error: any,
  doc: any,
  next: mongoose.HookNextFunction
) {
  let message: string;

  if (error.code === 11000) {
    message = Object.keys(error.keyValue)[0] + " already exists";
  }

  if (message) next(new UniqueError(message));
  else next();
}

export function postPatchErrorHandler(res: express.Response, error: any) {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: parseValidationErrors(error),
    } as errorResponse);
  } else if (error.name === "UniqueError") {
    return res.status(409).json({
      success: false,
      error: error.message,
    });
  } else {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}
