import express from "express";

import User from "../models/user";
import PasswordResetCode from "../models/passwordResetCode";
import { postPatchErrorHandler } from "../utils/errors";
import { User as UserType } from "../@types/models";
import { errorResponse, ResUser } from "../@types/response";
import {
  Request,
  Payload,
  RequestBody,
  SimpleRequestBody,
} from "../@types/request";
import { userResponse as userResponseType } from "../@types/response";
import { sign, verify } from "jsonwebtoken";
import { apiPath } from "../server";
import Mail from "../utils/Mail";

const userResponse = (req: Request, userData: UserType): ResUser => {
  let userRes: ResUser;
  userRes = {
    _id: userData._id,
    name: userData.name,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    username: userData.username,
    isAdmin: userData.isAdmin,
    isSuperAdmin: userData.isSuperAdmin,
    provider: req.provider,
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
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
    path: apiPath + "/users/refresh_token",
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

  let payload: Payload;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) as Payload;
  } catch (err) {
    // tslint:disable-next-line: no-console
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

// middleware
export async function ReqUser(
  req: Request,
  res: express.Response,
  next: express.NextFunction
) {
  // look for access token and create req.user
  const authHeader = req.headers.authorization;

  // if access token in header
  if (authHeader) {
    try {
      // parse token
      const token = authHeader.split(" ")[1];
      // read payload from token
      const payload: Payload = verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as Payload;
      // get the user that owns the token
      const user = await User.findById(payload.userID);

      // if user found
      if (user) {
        // set the user to the request
        req.user = userResponse(req, user);
        // create logout function
        req.logout = (resp: express.Response) => {
          sendRefreshToken(resp, "");
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

/**
 * @desc Login User
 * @route POST /api/v1/users/login
 * @access Public
 */
export async function loginUser(req: Request, res: express.Response) {
  try {
    const user = await User.findOne({ username: req.body.username });

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
          user: userResponse(req, user),
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
    // tslint:disable-next-line: no-console
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Create new access token
 * @route POST /api/v1/users/refresh_token
 * @access Restricted
 */
export async function refresh_token(req: Request, res: express.Response) {
  // get user from req.payload, set by the authRefreshToken middleware
  const user = await User.findById(req.payload.userID);
  // comment out if you do not want users staying logged in forever if they use the site every week
  sendRefreshToken(res, createRefreshToken(user));

  return res.status(200).send({
    success: true,
    data: {
      user: userResponse(req, user),
      accessToken: createAccessToken(user),
    },
  } as userResponseType);
}

/**
 * @desc Logout User
 * @route POST /api/v1/users/logout
 * @access Public
 */
export function logoutUser(req: Request, res: express.Response) {
  req.logout(res);

  req.session.destroy(() => {
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
 * @route POST /api/v1/users/register
 * @access Public
 */
export async function addUser(
  req: RequestBody<UserType & { re_password: string }>,
  res: express.Response
) {
  try {
    if (!req.user || (req.user && !req.user.isAdmin)) {
      delete req.body.isAdmin;
      delete req.body.isSuperAdmin;
      delete req.body.emailConfirmed;
    }

    if (req.body.password !== req.body.re_password)
      return res.status(400).json({
        success: false,
        error: "password and re_password do not match",
      });

    const user = await User.create(req.body);

    Mail.sendConfirmation(user);

    return res.status(201).json({
      success: true,
      data: { user: userResponse(req, user) },
    } as userResponseType);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}

/**
 * @desc Resend Email Confirmation
 * @route POST /api/v1/users/resendConfirmation
 * @access Public
 */
export async function resendConfirmation(
  req: SimpleRequestBody<{ username: string }>,
  res: express.Response
) {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user) {
      const confirmation = await Mail.sendConfirmation(user);

      if (!confirmation)
        return res.status(500).json({
          success: false,
          error: "Server was unable to send the email",
        } as errorResponse);

      return res.status(200).json({
        success: true,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: "No user found by that username",
      } as errorResponse);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    } as errorResponse);
  }
}

/**
 * @desc Get User
 * @route GET /api/v1/users
 * @access Restricted
 */
export async function getUser(req: Request, res: express.Response) {
  try {
    let user: UserType;
    if (req.user) user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found",
      } as errorResponse);
    }

    return res.status(200).json({
      success: true,
      data: { user: userResponse(req, user) },
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
 * @route DELETE /api/v1/users
 * @access Restricted
 */
export async function deleteUser(req: Request, res: express.Response) {
  try {
    let user: UserType;
    if (req.user) user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found",
      } as errorResponse);
    }

    await user.remove();

    req.logout(res);

    req.session.destroy(() => {
      clearCookies(res);

      res.status(200).json({
        success: true,
        data: { user: userResponse(req, user), accessToken: "" },
      } as userResponseType);
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    } as errorResponse);
  }
}

/**
 * @desc Request Password Reset
 * @route POST /api/v1/users/password/forgot
 * @access Public
 */
export async function forgotPassword(
  req: SimpleRequestBody<{ email: string }>,
  res: express.Response
) {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const confirmation = await Mail.forgotPassword(user);

      if (!confirmation)
        return res.status(500).json({
          success: false,
          error: "Server was unable to send the email",
        } as errorResponse);

      return res.status(200).json({
        success: true,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: "No user found by that email",
      } as errorResponse);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    } as errorResponse);
  }
}

/**
 * @desc Password Reset
 * @route POST /api/v1/users/password/reset/:code
 * @access Public
 */
export async function resetPassword(
  req: SimpleRequestBody<{ password: string; re_password: string }>,
  res: express.Response
) {
  try {
    const { code } = req.params;
    const { password, re_password } = req.body;

    if (code === null || code === undefined)
      return res.status(400).json({
        success: false,
        error: "Invalid Password Reset Code",
      } as errorResponse);

    const resetCode = await PasswordResetCode.findOne({ code });

    if (!resetCode || resetCode.code !== code)
      return res.status(400).json({
        success: false,
        error: "Invalid Password Reset Code",
      } as errorResponse);

    if (password !== re_password)
      return res.status(400).json({
        success: false,
        error: "password and re_password do not match",
      } as errorResponse);

    const user = await User.findById(resetCode.user);

    if (!user)
      return res.status(500).json({
        success: false,
        error: "Server Error",
      });

    user.password = password;
    await user.validate();
    await user.save();

    return res.status(200).json({
      success: true,
      data: userResponse(req, user),
    } as userResponseType);
  } catch (error) {
    postPatchErrorHandler(res, error);
  }
}
