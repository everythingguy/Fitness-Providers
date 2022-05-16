import { AddressResponse, ErrorResponse } from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export default class API {
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
}
