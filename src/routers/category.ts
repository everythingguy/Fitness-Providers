import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/category";

export const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .get(Controller.getCategories)
  .post(Permission.isAdmin, Controller.addCategory);

categoryRouter
  .route("/:id")
  .get(Controller.getCategory)
  .patch(Permission.isAdmin, Controller.modifyCategory)
  .delete(Permission.isAdmin, Controller.deleteCategory);

export default categoryRouter;
