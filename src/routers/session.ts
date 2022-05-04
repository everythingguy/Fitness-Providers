import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/session";

const router = express.Router();

router
  .route("/")
  .get(Controller.getSessions)
  .post(Permission.isLoggedInAsProvider, Controller.addSession);

router
  .route("/:id")
  .get(Controller.getSession)
  .patch(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfSession),
    Controller.modifySession
  )
  .delete(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfSession),
    Controller.deleteSession
  );

export default router;
