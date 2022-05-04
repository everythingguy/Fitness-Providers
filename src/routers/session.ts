import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/session";

const router = express.Router();

router
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

router
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

export default router;
