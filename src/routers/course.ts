import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/course";

const router = express.Router();

router
  .route("/")
  .get(Controller.getCourses)
  .post(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfProvider, false, "provider"),
    Controller.addCourse
  );

router
  .route("/:id")
  .get(Controller.getCourse)
  .patch(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfCourse),
    Permission.isOwnerOrAdmin(Permission.OwnerOfProvider, true, "provider"),
    Controller.modifyCourse
  )
  .delete(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfCourse),
    Controller.deleteCourse
  );

export default router;
