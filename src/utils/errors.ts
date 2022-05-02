import mongoose from "mongoose";

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
