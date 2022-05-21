import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/tag";

export const tagRouter = express.Router();

tagRouter
  .route("/")
  .get(Controller.getTags)
  .post(Permission.isAdmin, Controller.addTag);

tagRouter
  .route("/:id")
  .get(Controller.getTag)
  .patch(Permission.isAdmin, Controller.modifyTag)
  .delete(Permission.isAdmin, Controller.deleteTag);

export default tagRouter;
