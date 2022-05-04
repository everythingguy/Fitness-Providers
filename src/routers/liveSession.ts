import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/liveSession";

const router = express.Router();

router
  .route("/")
  .get(Controller.getLiveSessions)
  .post(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfSession, false, "session"),
    Controller.addLiveSession
  );

router
  .route("/:id")
  .get(Controller.getLiveSession)
  .patch(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfLiveSession),
    Permission.isOwnerOrAdmin(Permission.OwnerOfSession, true, "session"),
    Controller.modifyLiveSession
  )
  .delete(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfLiveSession),
    Controller.deleteLiveSession
  );

export default router;
