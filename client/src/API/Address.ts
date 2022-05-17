import {
  AddressesResponse,
  AddressResponse,
  ErrorResponse,
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
      country,
    });

    return new Promise((res) => {
      APIManager.sendRequest<AddressResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as AddressResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }

  static async getProvidersAddresses(
    providerID: string
  ): Promise<AddressesResponse | ErrorResponse> {
    const request = new DataRequest("GET", "addresses");

    request.setParams({
      provider: providerID,
    });

    return new Promise((res) => {
      APIManager.sendRequest<AddressesResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as AddressesResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }
}

export default Address;
