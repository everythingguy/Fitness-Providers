import express from "express";

import * as Permission from "../utils/permissions";

import * as Controller from "../controllers/user";

export const userRouter = express.Router();

userRouter.route("/login").post(Permission.isLoggedOut, Controller.loginUser);

userRouter
    .route("/refresh_token")
    .post(Controller.authRefreshToken, Controller.refresh_token);

userRouter.route("/logout").post(Permission.isLoggedIn, Controller.logoutUser);

userRouter.route("/register").post(Controller.addUser);

userRouter.route("/resendConfirmation").post(Controller.resendConfirmation);

userRouter.route("/password/forgot").post(Controller.forgotPassword);

userRouter.route("/password/reset/:code").post(Controller.resetPassword);

userRouter
    .route("/")
    .get(Permission.isLoggedIn, Controller.getUser)
    .delete(Permission.isLoggedIn, Controller.deleteUser);

export default userRouter;
