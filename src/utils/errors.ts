import express from "express";
import mongoose from "mongoose";
import { MongoError } from "mongodb";
import { errorResponse } from "../@types/response";

export class UniqueError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UniqueError";
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

export class ValidationError extends Error {
    errors: { [key: string]: Error };

    constructor(message: string, errors: { [key: string]: Error }) {
        super(message);
        this.name = "ValidationError";
        this.errors = errors;
    }
}

export function parseValidationErrors(error: any) {
    const errors: any = {};
    if (error.errors)
        for (const err in error.errors) {
            if (Object.prototype.hasOwnProperty.call(error.errors, err))
                errors[err] = error.errors[err].message;
        }
    else return error.message;
    return errors;
}

export function UniqueErrorRaiser<T>(
    error: MongoError,
    doc: mongoose.HydratedDocument<T>,
    next: mongoose.CallbackWithoutResultAndOptionalError
) {
    let message: string;

    if (error.code === 11000) {
        message = Object.keys((error as any).keyValue)[0] + " already exists";
    }

    if (message) next(new UniqueError(message));
    else next();
}

export function postPatchErrorHandler(res: express.Response, error: any) {
    if (error.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            error: parseValidationErrors(error)
        } as errorResponse);
    } else if (error.name === "UniqueError") {
        return res.status(409).json({
            success: false,
            error: { [error.message.split(" ")[0]]: error.message }
        });
    } else if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            error: "Invalid ObjectId"
        } as errorResponse);
    } else {
        // eslint-disable-next-line no-console
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Server Error"
        } as errorResponse);
    }
}
