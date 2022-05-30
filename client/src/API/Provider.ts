import {
    ProviderResponse,
    ProvidersResponse,
    ErrorResponse
} from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export class Provider {
    static async createProvider(
        bio: string,
        website: string,
        phone: string
    ): Promise<ProviderResponse | ErrorResponse> {
        const request = new DataRequest("POST", "providers");

        request.setBody({
            bio: bio && bio.length > 0 ? bio : undefined,
            website: website && website.length > 0 ? website : undefined,
            phone
        });

        return new Promise((res) => {
            APIManager.sendRequest<ProviderResponse>(
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

    static async setAddress(
        providerID: string,
        addressID: string
    ): Promise<ProviderResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `providers/${providerID}`);

        request.setBody({
            address: addressID
        });

        return new Promise((res) => {
            APIManager.sendRequest<ProviderResponse>(
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

    static async getProviders(params?: {
        [key: string]: any;
    }): Promise<ProvidersResponse | ErrorResponse> {
        const request = new DataRequest("GET", `providers`);

        if (params) request.setParams(params);

        return new Promise((res) => {
            APIManager.sendRequest<ProvidersResponse>(
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

    static async getProvider(
        providerID: string
    ): Promise<ProviderResponse | ErrorResponse> {
        const request = new DataRequest("GET", `providers/${providerID}`);

        return new Promise((res) => {
            APIManager.sendRequest<ProviderResponse>(
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

    static async updateProvider(
        providerID: string,
        body: {
            [key: string]: any;
        }
    ): Promise<ProviderResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `providers/${providerID}`);

        request.setBody(body);

        return new Promise((res) => {
            APIManager.sendRequest<ProviderResponse>(
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

export default Provider;
