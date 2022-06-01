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

userRouter
    .route("/password/change")
    .post(
        Permission.isLoggedIn,
        Permission.isOwnerOrAdmin(Permission.OwnerOfUser),
        Controller.changePassword
    );

userRouter.route("/password/forgot").post(Controller.forgotPassword);

userRouter.route("/password/reset/:code").post(Controller.resetPassword);

/* TODO:
userRouter
    .route("/")
    .get(Permission.isAdmin, Controller.getUsers);
    */

userRouter
    .route("/:id")
    .patch(
        Permission.isLoggedIn,
        Permission.isOwnerOrAdmin(Permission.OwnerOfUser),
        Controller.updateUser
    );
/* TODO:
    .get(
        Permission.isLoggedIn,
        Permission.isOwnerOrAdmin(Permission.OwnerOfUser),
        Controller.getUser
    );
    .delete(Permission.isAdmin, Controller.deleteUser);
    */

userRouter
    .route("/me")
    .get(Permission.isLoggedIn, Controller.getMyUser)
    .delete(Permission.isLoggedIn, Controller.deleteMyUser);
export default userRouter;
