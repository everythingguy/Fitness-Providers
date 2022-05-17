import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/category";

const router = express.Router();

router
  .route("/")
  .get(Controller.getCategories)
  .post(Permission.isAdmin, Controller.addCategory);

router
  .route("/:id")
  .get(Controller.getCategory)
  .patch(Permission.isAdmin, Controller.modifyCategory)
  .delete(Permission.isAdmin, Controller.deleteCategory);

export default router;
