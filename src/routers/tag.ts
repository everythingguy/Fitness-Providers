import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/tag";

const router = express.Router();

router
  .route("/")
  .get(Controller.getTags)
  .post(Permission.isAdmin, Controller.addTag);

router
  .route("/:id")
  .get(Controller.getTag)
  .patch(Permission.isAdmin, Controller.modifyTag)
  .delete(Permission.isAdmin, Controller.deleteTag);

export default router;
