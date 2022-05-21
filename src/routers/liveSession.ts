import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/liveSession";

export const liveSessionRouter = express.Router();

liveSessionRouter
    .route("/")
    .get(Controller.getLiveSessions)
    .post(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfSession,
            false,
            "session",
            "You cannot create a live session for another provider's session"
        ),
        Controller.addLiveSession
    );

liveSessionRouter
    .route("/:id")
    .get(Controller.getLiveSession)
    .patch(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfLiveSession),
        Permission.isOwnerOrAdmin(
            Permission.OwnerOfSession,
            true,
            "session",
            "You cannot give your live session to another provider's session"
        ),
        Controller.modifyLiveSession
    )
    .delete(
        Permission.isLoggedInAsProvider,
        Permission.isOwnerOrAdmin(Permission.OwnerOfLiveSession),
        Controller.deleteLiveSession
    );

export default liveSessionRouter;
