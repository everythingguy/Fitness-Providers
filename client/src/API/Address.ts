import {
    AddressesResponse,
    AddressResponse,
    ErrorResponse
} from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export class Address {
    static async createAddress(
        street1: string,
        street2: string,
        city: string,
        state: string,
        zip: string,
        country: string
    ): Promise<AddressResponse | ErrorResponse> {
        const request = new DataRequest("POST", "addresses");

        request.setBody({
            street1,
            street2: street2 && street2.length > 0 ? street2 : undefined,
            city,
            state,
            zip,
            country
        });

        return new Promise((res) => {
            APIManager.sendRequest<AddressResponse>(
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

    static async getAddress(
        id: string
    ): Promise<AddressResponse | ErrorResponse> {
        const request = new DataRequest("GET", `addresses/${id}`);

        return new Promise((res) => {
            APIManager.sendRequest<AddressResponse>(
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

    static async getProvidersAddresses(
        providerID: string
    ): Promise<AddressesResponse | ErrorResponse> {
        const request = new DataRequest("GET", "addresses");

        request.setParams({
            provider: providerID
        });

        return new Promise((res) => {
            APIManager.sendRequest<AddressesResponse>(
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

    static async updateAddress(
        id: string,
        street1: string,
        street2: string,
        city: string,
        state: string,
        zip: string,
        country: string
    ): Promise<AddressResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `addresses/${id}`);

        request.setBody({
            street1,
            street2: street2 && street2.length > 0 ? street2 : null,
            city,
            state,
            zip,
            country
        });

        return new Promise((res) => {
            APIManager.sendRequest<AddressResponse>(
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

    static async deleteAddress(
        id: string
    ): Promise<AddressResponse | ErrorResponse> {
        const request = new DataRequest("DELETE", `addresses/${id}`);

        return new Promise((res) => {
            APIManager.sendRequest<AddressResponse>(
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

export default Address;
