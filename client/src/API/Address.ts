import {
    AddressesResponse,
    AddressResponse,
    ErrorResponse
} from "../@types/Response";
import { Address as AddressType } from "../@types/Models";
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

    static async getAllProvidersAddresses(
        providerID: string,
        params: { [key: string]: string[] | string | number[] | number } = {}
    ) {
        return APIManager.sendRequestAll<AddressType>(
            Address.getProvidersAddresses as any,
            "addresses",
            [providerID],
            params
        );
    }

    static async getProvidersAddresses(
        providerID: string,
        params: { [key: string]: string[] | string | number[] | number } = {}
    ): Promise<AddressesResponse | ErrorResponse> {
        const request = new DataRequest("GET", "addresses");

        request.setParams({
            ...params,
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
