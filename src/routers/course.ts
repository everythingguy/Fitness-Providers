import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/course";
import Model from "../models/course";
import { upload, uploadImageHandler } from "../utils/s3";

export const courseRouter = express.Router();

courseRouter
    .route("/")
    .get(Controller.getCourses)
    .post(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfProvider,
            true,
            "provider",
            "You cannot create course for another provider"
        ),
        Controller.addCourse
    );

courseRouter
    .route("/:id")
    .get(Controller.getCourse)
    .patch(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfCourse),
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfProvider,
            true,
            "provider",
            "You cannot give your course to another provider"
        ),
        Controller.modifyCourse
    )
    .delete(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfCourse),
        Controller.deleteCourse
    );

courseRouter
    .route("/:id/image")
    .patch(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfCourse),
        upload.single("image"),
        uploadImageHandler(Model, "course")
    );

export default courseRouter;
