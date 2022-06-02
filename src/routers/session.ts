import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/session";
import Model from "../models/session";
import { upload, uploadImageHandler } from "../utils/s3";

export const sessionRouter = express.Router();

sessionRouter
    .route("/")
    .get(Controller.getSessions)
    .post(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfCourse,
            false,
            "course",
            "You cannot create a session for another provider's course"
        ),
        Controller.addSession
    );

sessionRouter
    .route("/:id")
    .get(Controller.getSession)
    .patch(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfSession),
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfCourse,
            true,
            "course",
            "You cannot give your session to another provider's course"
        ),
        Controller.modifySession
    )
    .delete(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfSession),
        Controller.deleteSession
    );

sessionRouter
    .route("/:id/image")
    .patch(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfSession),
        upload.single("image"),
        uploadImageHandler(Model, "Session")
    );

export default sessionRouter;
