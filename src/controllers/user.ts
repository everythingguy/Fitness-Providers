import express from "express";

import User from "../models/user";
import { User as UserType } from "../types/models";
import { errorResponse, ResUser } from "../types/response";
import { userResponse as userResponseType } from "../types/response";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { apiPath } from "../server";

interface Request extends express.Request {
  user?: ResUser;
  payload?: payload;
  logout: (res: express.Response) => void;
}

interface payload extends JwtPayload {
  userID: string;
  tokenVersion: number;
}

const userResponse = (userData: UserType): ResUser => {
  var userRes: ResUser;
  userRes = {
    _id: userData._id,
    name: userData.name,
    email: userData.email,
    username: userData.username,
  };

  return userRes;
};

const createRefreshToken = (user: UserType) => {
  return sign(
    { userID: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};

const createAccessToken = (user: UserType) => {
  return sign({ userID: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

const sendRefreshToken = (res: express.Response, token: string) => {
  res.cookie("jid", token, {
    httpOnly: true,
    path: apiPath + "/user/refresh_token",
  });
};

const clearCookies = (res: express.Response) => {
  res.clearCookie("connect.sid");
  res.clearCookie("jid");
};

export const authRefreshToken = async (
  req: Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.cookies.jid;
  if (!token) {
    return res.status(401).send({
      success: false,
      error: "Not authenticated",
    } as errorResponse);
  }

  var payload: payload;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) as payload;
  } catch (err) {
    console.log(err);
    return res.status(401).send({
      success: false,
      error: "Not authenticated",
    } as errorResponse);
  }

  const user = await User.findById(payload.userID);

  if (!user) {
    return res.status(500).send({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.status(401).send({
      success: false,
      error: "Not authenticated",
    } as errorResponse);
  }

  req.payload = payload;

  return next();
};

//middleware
export async function ReqUser(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  //look for access token and create req.user
  const authHeader = req.headers["authorization"];

  //if access token in header
  if (authHeader) {
    try {
      //parse token
      const token = authHeader.split(" ")[1];
      //read payload from token
      const payload: payload = verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as payload;
      //get the user that owns the token
      const user = await User.findById(payload.userID);

      //if user found
      if (user) {
        //set the user to the request
        req.user = userResponse(user);
        //create logout function
        req.logout = async (res: express.Response) => {
          sendRefreshToken(res, "");
        };
      }
    } catch (err) {
      req.user = undefined;
    }
  }

  next();
}

async function revokeRefreshTokensForUser(req: Request) {
  const u = await User.findById(req.user._id);
  u.tokenVersion = u.tokenVersion + 1;
  await u.save();
}

export function isLoggedIn(
  req: Request,
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
  req: Request,
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
export async function loginUser(req: Request, res: express.Response) {
  try {
    var user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Inncorrect Username or Password",
      } as errorResponse);
    }

    if (await user.isValidPassword(req.body.password)) {
      sendRefreshToken(res, createRefreshToken(user));

      return res.status(200).json({
        success: true,
        data: {
          user: userResponse(user),
          accessToken: createAccessToken(user),
        },
      } as userResponseType);
    } else {
      return res.status(401).json({
        success: false,
        error: "Inncorrect Username or Password",
      } as errorResponse);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Create new access token
 * @route POST /api/v1/user/refresh_token
 * @access Restricted
 */
export async function refresh_token(req: Request, res: express.Response) {
  //get user from req.payload, set by the authRefreshToken middleware
  const user = await User.findById(req.payload.userID);
  //comment out if you do not want users staying longed in forever if they use the site every week
  sendRefreshToken(res, createRefreshToken(user));

  return res.status(200).send({
    success: true,
    data: {
      user: userResponse(user),
      accessToken: createAccessToken(user),
    },
  } as userResponseType);
}

/**
 * @desc Logout User
 * @route POST /api/v1/user/logout
 * @access Public
 */
export function logoutUser(req: Request, res: express.Response) {
  req.logout(res);

  req.session.destroy(function () {
    clearCookies(res);

    res.status(200).json({
      success: true,
      data: {
        accessToken: "",
      },
    } as userResponseType);
  });
}

/**
 * @desc Add User
 * @route POST /api/v1/user/register
 * @access Public
 */
export async function addUser(req: Request, res: express.Response) {
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
        data: { user: userResponse(user) },
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
export async function getUser(req: Request, res: express.Response) {
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
      data: { user: userResponse(user) },
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
export async function deleteUser(req: Request, res: express.Response) {
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

    req.logout(res);

    req.session.destroy(function () {
      clearCookies(res);

      res.status(200).json({
        success: true,
        data: { user: userResponse(user), accessToken: "" },
      } as userResponseType);
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}
