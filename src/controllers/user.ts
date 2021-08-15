import passport from "passport";
import PassportLocal from "passport-local";
import express from "express";

import User from "../models/user";
import { User as UserType } from "../types/models";
import { UserDoc } from "./../types/passport";
import { errorResponse, ResUser } from "../types/response";
import { userResponse as userResponseType } from "../types/response";

const LocalStrategy = PassportLocal.Strategy;

passport.serializeUser((user: UserDoc, done) => {
  done(null, user._doc._id);
});

passport.deserializeUser(async (id, done) => {
  var userData = await User.findById(id);
  if (userData) {
    done(null, userData);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      var user = await User.findOne({ username });

      if (!user) {
        return done(null, false, {
          message: "Inncorrect Username or Password",
        });
      }

      if (await user.isValidPassword(password)) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: "Inncorrect Username or Password",
        });
      }
    } catch (err) {
      console.log(err);
      return done(err);
    }
  })
);

const userResponse = (userData: UserType | UserDoc): ResUser => {
  var userRes: ResUser;
  if ((userData as UserDoc)._doc) userRes = { ...(userData as UserDoc)._doc };
  else userRes = { ...(userData as UserType) };

  delete userRes.password;
  return userRes;
};

//middleware
export function isLoggedIn(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.user) next();
  else
    res.status(401).json({
      success: false,
      error: "Please signin to gain access",
    } as errorResponse);
}

export function isLoggedOut(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.user) {
    res.status(400).json({
      success: false,
      error: "Please logout before logging in",
    } as errorResponse);
  } else next();
}

/**
 * @desc Login User
 * @route POST /api/v1/user/login
 * @access Public
 */
export function loginUser(req: any, res: express.Response) {
  return res.status(200).json({
    success: true,
    data: userResponse(req.user),
  } as userResponseType);
}

/**
 * @desc Logout User
 * @route POST /api/v1/user/logout
 * @access Public
 */
export function logoutUser(req: express.Request, res: express.Response) {
  req.logout();

  req.session.destroy(function () {
    res.clearCookie("connect.sid");

    res.status(200).json({
      success: true,
    } as userResponseType);
  });
}

/**
 * @desc Add User
 * @route POST /api/v1/user/register
 * @access Public
 */
export async function addUser(req: express.Request, res: express.Response) {
  try {
    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("email", "Email is required").notEmpty();
    req.checkBody("email", "Email is not valid").isEmail();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    req
      .checkBody("password", "Password must be at least 5 digits long")
      .isLength({ min: 5 });

    var errors = req.validationErrors();

    if (errors) {
      console.log(errors);
      return res.status(400).json({
        success: false,
        error: errors,
      } as errorResponse);
    } else {
      var uniqueCheck = await User.findOne({
        username: req.body.username,
      });
      if (uniqueCheck) {
        return res.status(409).json({
          success: false,
          error: "Username already in use",
        } as errorResponse);
      }

      uniqueCheck = await User.findOne({ email: req.body.email });
      if (uniqueCheck) {
        return res.status(409).json({
          success: false,
          error: "Email already in use",
        } as errorResponse);
      }

      const user = await User.create(req.body);

      return res.status(201).json({
        success: true,
        data: userResponse(user),
      } as userResponseType);
    }
  } catch (err) {
    if (err.name === "ValidationError") {
      const msgs = Object.values(err.errors).map((val: any) => val.message);

      return res.status(400).json({
        success: false,
        error: msgs,
      } as errorResponse);
    } else {
      return res.status(500).json({
        success: false,
        error: "Server Error",
      } as errorResponse);
    }
  }
}

/**
 * @desc Get User
 * @route GET /api/v1/user
 * @access Restricted
 */
export async function getUser(req: any, res: express.Response) {
  try {
    var user: UserType;
    if (req.user) user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found",
      } as errorResponse);
    }

    return res.status(200).json({
      success: true,
      data: userResponse(user),
    } as userResponseType);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Delete User
 * @route DELETE /api/v1/user
 * @access Restricted
 */
export async function deleteUser(req: any, res: express.Response) {
  try {
    var user: UserType;
    if (req.user) user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found",
      } as errorResponse);
    }

    await user.remove();

    req.logout();

    req.session.destroy(function () {
      res.clearCookie("connect.sid");

      res.status(200).json({
        success: true,
        data: userResponse(user),
      } as userResponseType);
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}
