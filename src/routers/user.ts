import express from "express";
import passport from "passport";

import { loginUser, logoutUser, addUser, getUser, deleteUser, isLoggedIn, isLoggedOut } from "../controllers/user";

const router = express.Router();

router
    .route('/login')
    .post(isLoggedOut, passport.authenticate("local", {session: true}), loginUser);

router
    .route('/logout')
    .post(isLoggedIn, logoutUser);

router
    .route('/register')
    .post(addUser);

router
    .route('/')
    .get(isLoggedIn, getUser)
    .delete(isLoggedIn, deleteUser);

export default router;