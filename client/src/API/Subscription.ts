import {
    SuccessfulResponse,
    SubscriptionResponse,
    ErrorResponse
} from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export default class Subscription {
    static async getSubscription(): Promise<
        SubscriptionResponse | ErrorResponse
    > {
        const request = new DataRequest("GET", "paypal/subscription");

        return new Promise((res) => {
            APIManager.sendRequest<SubscriptionResponse>(
                request,
                (resp) => {
                    res(resp);
                },
                (resp) => {
                    res(resp);
                }
            );
        });
    }

    static async cancelSubscription(): Promise<
        SuccessfulResponse | ErrorResponse
    > {
        const request = new DataRequest("POST", "paypal/subscription/cancel");

        return new Promise((res) => {
            APIManager.sendRequest<SuccessfulResponse>(
                request,
                (resp) => {
                    res(resp);
                },
                (resp) => {
                    res(resp);
                }
            );
        });
    }
}
