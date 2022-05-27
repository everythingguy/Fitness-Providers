import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/provider";
import Model from "../models/provider";
import { upload, uploadImageHandler } from "../utils/s3";

export const providerRouter = express.Router();

providerRouter
    .route("/")
    .get(Controller.getProviders)
    .post(
        Permission.isLoggedIn,
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfUser,
            true,
            "user",
            "You cannot create a provider account for another user"
        ),
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfAddress,
            true,
            "address",
            "You cannot use another provider's address"
        ),
        Controller.addProvider
    );

providerRouter
    .route("/:id")
    .get(Controller.getProvider)
    .patch(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfProvider),
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfUser,
            true,
            "user",
            "You cannot give your provider account to another user"
        ),
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfAddress,
            true,
            "address",
            "You cannot use another provider's address"
        ),
        Controller.modifyProvider
    )
    .delete(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfProvider),
        Controller.deleteProvider
    );

providerRouter
    .route("/:id/image")
    .patch(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfProvider),
        upload.single("image"),
        uploadImageHandler(Model, "provider")
    );

export default providerRouter;
