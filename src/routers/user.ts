import express from "express";

import * as Permission from "../utils/permissions";

import * as Controller from "../controllers/user";

const router = express.Router();

router.route("/login").post(Permission.isLoggedOut, Controller.loginUser);

router
  .route("/refresh_token")
  .post(Controller.authRefreshToken, Controller.refresh_token);

router.route("/logout").post(Permission.isLoggedIn, Controller.logoutUser);

router.route("/register").post(Controller.addUser);

router.route("/resendConfirmation").post(Controller.resendConfirmation);

router.route("/password/forgot").post(Controller.forgotPassword);

router.route("/password/reset/:code").post(Controller.resetPassword);

router
  .route("/")
  .get(Permission.isLoggedIn, Controller.getUser)
  .delete(Permission.isLoggedIn, Controller.deleteUser);

export default router;
