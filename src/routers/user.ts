import express from "express";

import {
  loginUser,
  logoutUser,
  addUser,
  getUser,
  deleteUser,
  isLoggedIn,
  isLoggedOut,
  refresh_token,
  authRefreshToken,
} from "../controllers/user";

const router = express.Router();

router.route("/login").post(isLoggedOut, loginUser);

router.route("/refresh_token").post(authRefreshToken, refresh_token);

router.route("/logout").post(isLoggedIn, logoutUser);

router.route("/register").post(addUser);

router.route("/").get(isLoggedIn, getUser).delete(isLoggedIn, deleteUser);

export default router;
