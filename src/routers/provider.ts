import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/provider";

const router = express.Router();

router
  .route("/")
  .get(Controller.getProviders)
  .post(
    Permission.isLoggedIn,
    Permission.isOwnerOrAdmin(Permission.OwnerOfUser, false, "user"),
    Controller.addProvider
  );

router
  .route("/:id")
  .get(Controller.getProvider)
  .patch(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfProvider),
    Permission.isOwnerOrAdmin(Permission.OwnerOfUser, true, "user"),
    Controller.modifyProvider
  )
  .delete(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfProvider),
    Controller.deleteProvider
  );

export default router;
