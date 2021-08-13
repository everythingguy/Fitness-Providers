import passport from "passport";
import PassportLocal from "passport-local";
import express from "express";

import User from "../models/user";
import { User as UserType } from "../types/models"; 

const LocalStrategy = PassportLocal.Strategy;

passport.serializeUser((user: UserType, done) => {
    done(null, user._doc._id);
});

passport.deserializeUser(async (id, done) => {
    var userData = await User.findById(id);
    if(userData) {
        done(null, userData);
    }
});

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        var user = await User.findOne({username});

        if(!user) {
            return done(null, false, {message: 'Inncorrect Username or Password'});
        }

        if(await user.isValidPassword(password)) {
            return done(null, user);
        } else {
            return done(null, false, {message: 'Inncorrect Username or Password'});
        }
    } catch(err) {
        console.log(err);
        return done(err);
    }
}));

const userResponse = (userData: UserType) => {
    var userRes = null;
    if(userData._doc)
        userRes = {...userData._doc};
    else
        userRes = {...userData};
    delete userRes.password;
    return userRes;
};

//middleware
export function isLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(req.user) next();
    else res.status(401).json({
        success: false,
        error: "Please signin to gain access"
    });
}

export function isLoggedOut(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(req.user) {
        res.status(400).json({
            success: false,
            error: "Please logout before logging in"
        });
    } else next();
}

/**
 * @desc Login User
 * @route POST /api/v1/user/login
 * @access Public
 */
export function loginUser(req: any, res: express.Response) {
    return res.json({
        success: true,
        data: userResponse(req.user)
    });
}

/**
 * @desc Logout User
 * @route POST /api/v1/user/logout
 * @access Public
 */
export function logoutUser(req: express.Request, res: express.Response) {
    req.logout();

    req.session.destroy(function() {
        res.clearCookie('connect.sid');

        res.json({
            success: true
        });
    });
}

/**
 * @desc Add User
 * @route POST /api/v1/user/register
 * @access Public
 */
export async function addUser(req: express.Request, res: express.Response) {
    try {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('password', 'Password must be at least 5 digits long').isLength({min: 5});

        var errors = req.validationErrors();

        if(errors) {
            return res.status(400).json({
                success: false,
                error: errors
            });
        } else {
            var user = await User.create(req.body);

            return res.status(201).json({
                success: true,
                data: userResponse(user)
            });
        }
    } catch (err) {
        if(err.name === "ValidationError") {
            const msgs = Object.values(err.errors).map((val: any) => val.message);

            return res.status(400).json({
                success: false,
                error: msgs
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "Server Error"
            });
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
        var user = null;
        if(req.user) user = await User.findById(req.user._id);

        if(!user) {
            return res.status(404).json({
                success: false,
                error: "No user found"
            });
        }

        return res.status(200).json({
            success: true,
            data: userResponse(user)
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
}

/**
 * @desc Delete User
 * @route DELETE /api/v1/user
 * @access Restricted
 */
export async function deleteUser(req: any, res: express.Response) {
    try {
        var user = null;
        if(req.user) user = await User.findById(req.user._id);

        if(!user) {
            return res.status(404).json({
                success: false,
                error: "No user found"
            });
        }

        await user.remove();

        return res.status(200).json({
            success: true,
            data: userResponse(user)
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
}