import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/course";

const router = express.Router();

router
  .route("/")
  .get(Controller.getCourses)
  .post(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(
      Permission.OwnerOfProvider,
      false,
      "provider",
      "You cannot create course for another provider"
    ),
    Controller.addCourse
  );

router
  .route("/:id")
  .get(Controller.getCourse)
  .patch(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfCourse),
    Permission.isOwnerOrAdmin(
      Permission.OwnerOfProvider,
      true,
      "provider",
      "You cannot give your course to another provider"
    ),
    Controller.modifyCourse
  )
  .delete(
    Permission.isLoggedInAsProvider,
    Permission.isOwnerOrAdmin(Permission.OwnerOfCourse),
    Controller.deleteCourse
  );

export default router;
