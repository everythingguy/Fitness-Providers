import express from "express";
import { Request } from "../@types/request";
import PayPalManager from "../utils/paypal";
import Provider from "../models/provider";

/**
 * @desc Handle PayPal Subscription Webhook
 * @route POST /api/v1/paypal/webhook
 * @access Public
 */
export async function handleWebhook(req: Request, res: express.Response) {
    // TODO:
    // eslint-disable-next-line no-console
    console.log(req);
    res.status(200).send();
}

/**
 * @desc Get the logged in user's subscription
 * @route GET /api/v1/paypal/subscription
 * @access Restricted
 */
export async function getSubscription(req: Request, res: express.Response) {
    if (!req.provider.subscription)
        res.status(400).json({
            success: false,
            error: "You do not have a subscription"
        });

    if (PayPalManager.access_token.length === 0)
        await PayPalManager.setAccessToken();

    const subscription = await PayPalManager.getSubscription(
        req.provider.subscription
    );

    res.status(200).json({ success: true, data: { subscription } });
}

/**
 * @desc Cancel the logged in user's subscription
 * @route POST /api/v1/paypal/subscription/cancel
 * @access Restricted
 */
export async function cancelSubscription(req: Request, res: express.Response) {
    if (!req.provider.subscription)
        res.status(400).json({
            success: false,
            error: "You do not have a subscription"
        });

    if (PayPalManager.access_token.length === 0)
        await PayPalManager.setAccessToken();

    const success = await PayPalManager.cancelSubscription(
        req.provider.subscription
    );

    if (success) {
        const p = await Provider.findById(req.provider._id);
        delete p.subscription;
        p.isEnrolled = false;
        await p.save();

        res.status(200).json({ success: true });
    } else res.status(500).json({ success: false });
}
