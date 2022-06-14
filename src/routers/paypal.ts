import express from "express";

import * as Permission from "../utils/permissions";
import * as Controller from "../controllers/paypal";

export const paypalRouter = express.Router();

paypalRouter
    .route("/webhook")
    .get(Controller.handleWebhook)
    .post(Controller.handleWebhook);

paypalRouter
    .route("/subscription")
    .get(Permission.isLoggedInAsProvider, Controller.getSubscription);

paypalRouter
    .route("/subscription/cancel")
    .post(Permission.isLoggedInAsProvider, Controller.cancelSubscription);

export default paypalRouter;
