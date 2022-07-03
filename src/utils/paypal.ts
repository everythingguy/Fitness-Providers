/* eslint-disable no-console */
import fetch from "node-fetch";
import Config from "../models/config";
import Provider from "../models/provider";
import connectDB, { getMongoURI } from "./db";
import * as Type from "../@types/paypal";

const PAYPAL_API_URL = process.env.PAYPAL_API_URL;

export default class PayPalManager {
    static access_token = "";
    static app_id: string;
    static timer: NodeJS.Timeout = null;

    static async setAccessToken() {
        const resp = await fetch(`${PAYPAL_API_URL}/oauth2/token`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-Language": "en_US",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
                ).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials",
            redirect: "follow"
        });

        const { access_token, app_id, expires_in } = await resp.json();

        this.access_token = access_token;
        this.app_id = app_id;

        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.access_token = "";
        }, (expires_in - 100) * 1000);
    }

    static async getProducts(): Promise<Type.Product[]> {
        const resp = await fetch(`${PAYPAL_API_URL}/catalogs/products`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`
            }
        });

        const data = await resp.json();
        return data.products;
    }

    static async getProduct(id: string): Promise<Type.Product> {
        const resp = await fetch(`${PAYPAL_API_URL}/catalogs/products/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`
            }
        });

        const data = await resp.json();
        return data;
    }

    static async postProduct(body: Type.Product): Promise<Type.Product> {
        const resp = await fetch(`${PAYPAL_API_URL}/catalogs/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`
            },
            body: JSON.stringify(body)
        });

        const data = await resp.json();
        console.log("post product");
        return data;
    }

    static async updateProduct(
        id: string,
        body: {
            op: "add" | "replace" | "remove";
            path: string;
            value: string;
        }[]
    ) {
        await fetch(`${PAYPAL_API_URL}/catalogs/products/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`
            },
            body: JSON.stringify(body)
        });

        console.log("patch product");
    }

    static async getPlans(): Promise<Type.Plan[]> {
        const resp = await fetch(`${PAYPAL_API_URL}/billing/plans`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`
            }
        });

        const data = await resp.json();
        return data.plans;
    }

    static async getPlan(id: string): Promise<Type.Plan> {
        const resp = await fetch(`${PAYPAL_API_URL}/billing/plans/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`
            }
        });

        const data = await resp.json();
        return data;
    }

    static async postPlan(body: Type.Plan): Promise<Type.Plan> {
        const resp = await fetch(`${PAYPAL_API_URL}/billing/plans`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`
            },
            body: JSON.stringify(body)
        });

        const data = await resp.json();
        console.log("post plan");
        return data;
    }

    static async updatePlan(
        id: string,
        body: {
            op: "add" | "replace" | "remove";
            path: string;
            value: string;
        }[]
    ) {
        await fetch(`${PAYPAL_API_URL}/billing/plans/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`
            },
            body: JSON.stringify(body)
        });

        console.log("patch plan");
    }

    static async getSubscription(id: string): Promise<Type.Subscription> {
        const resp = await fetch(
            `${PAYPAL_API_URL}/billing/subscriptions/${id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.access_token}`
                }
            }
        );

        const data = await resp.json();
        return data;
    }

    static async cancelSubscription(
        id: string,
        reason = "Unspecified"
    ): Promise<boolean> {
        const resp = await fetch(
            `${PAYPAL_API_URL}/billing/subscriptions/${id}/cancel`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.access_token}`
                },
                body: JSON.stringify({
                    reason
                })
            }
        );

        return resp.status == 204;
    }
}

async function syncSubscriptions() {
    const providers = await Provider.find({ subscription: { $exists: true } });
    const promises: Promise<void>[] = [];

    for (const provider of providers) {
        const promise = new Promise<void>((res) => {
            PayPalManager.getSubscription(provider.subscription).then(
                async (subscription) => {
                    if (provider.isEnrolled) {
                        if (
                            subscription.status !== "ACTIVE" ||
                            provider._id.toString() !== subscription.custom_id
                        ) {
                            provider.isEnrolled = false;
                            await provider.save();
                        }
                    } else {
                        if (
                            subscription.status === "ACTIVE" &&
                            provider._id.toString() === subscription.custom_id
                        ) {
                            provider.isEnrolled = true;
                            await provider.save();
                        }
                    }
                    res();
                }
            );
        });

        promises.push(promise);
    }

    await Promise.all(promises);
}

async function main() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("dotenv").config();

    const conn = await connectDB(getMongoURI());

    let paypalConf = await Config.findOne({ type: "paypal" });

    if (!paypalConf)
        paypalConf = new Config({
            type: "paypal",
            data: {
                product: {
                    name: "Test Product",
                    description: "This is a test product",
                    type: "SERVICE",
                    category: "SOFTWARE",
                    image_url: "https://via.placeholder.com/500x1000",
                    home_url:
                        process.env.BASE_URL === "http://localhost"
                            ? "https://dev.duraken.com"
                            : process.env.BASE_URL
                } as Type.Product,
                plan: {
                    name: "Test Plan",
                    description: "This is a test plan",
                    billing_cycles: [
                        {
                            frequency: {
                                interval_unit: "MONTH",
                                interval_count: 1
                            },
                            tenure_type: "TRIAL",
                            sequence: 1,
                            total_cycles: 1
                        },
                        {
                            frequency: {
                                interval_unit: "MONTH",
                                interval_count: 1
                            },
                            tenure_type: "REGULAR",
                            sequence: 2,
                            total_cycles: 0,
                            pricing_scheme: {
                                fixed_price: {
                                    value: "25",
                                    currency_code: "USD"
                                }
                            }
                        }
                    ],
                    payment_preferences: {
                        auto_bill_outstanding: true,
                        payment_failure_threshhold: 1
                    }
                } as Type.Plan
            }
        });

    await PayPalManager.setAccessToken();

    const product_config = paypalConf.data.product;
    const plan_config = paypalConf.data.plan;

    let product: Type.Product = product_config.id
        ? await PayPalManager.getProduct(product_config.id)
        : null;

    let plan: Type.Plan = plan_config.id
        ? await PayPalManager.getPlan(plan_config.id)
        : null;

    if (product) {
        if (
            product.name !== product_config.name ||
            product.description !== product_config.description ||
            product.image_url !== product_config.image_url ||
            product.home_url !== product_config.home_url
        )
            await PayPalManager.updateProduct(product.id, [
                {
                    op: "replace",
                    path: "/name",
                    value: product_config.name
                },
                {
                    op: "replace",
                    path: "/description",
                    value: product_config.description
                },
                {
                    op: "replace",
                    path: "/image_url",
                    value: product_config.image_url
                },
                {
                    op: "replace",
                    path: "/home_url",
                    value: product_config.home_url
                }
            ]);

        product = await PayPalManager.getProduct(paypalConf.data.product.id);
    } else {
        product = await PayPalManager.postProduct(
            product_config as Type.Product
        );
        paypalConf.data.product.id = product.id;
        paypalConf.markModified("data");
        await paypalConf.save();
    }

    if (plan) {
        if (
            plan.name !== plan_config.name ||
            plan.description !== plan_config.description
        ) {
            await PayPalManager.updatePlan(plan.id, [
                {
                    op: "replace",
                    path: "/name",
                    value: plan_config.name
                },
                {
                    op: "replace",
                    path: "/description",
                    value: plan_config.description
                }
            ]);

            plan = await PayPalManager.getPlan(paypalConf.data.plan.id);
        }
    } else {
        paypalConf.data.plan.product_id = product.id;
        plan_config.product_id = product.id;

        plan = await PayPalManager.postPlan(plan_config as Type.Plan);
        paypalConf.data.plan.id = plan.id;
        paypalConf.markModified("data");
        await paypalConf.save();
    }

    console.log({ product, plan });
    console.log(
        "Please set the following environment variable: PAYPAL_PLAN_ID=" +
            plan.id
    );

    await syncSubscriptions();

    await conn.disconnect();

    process.exit(0); // TODO: close without
}

if (require.main === module) main();
