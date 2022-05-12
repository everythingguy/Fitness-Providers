import { ProviderResponse, ErrorResponse } from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export default class API {
  static async createProvider(
    bio: string,
    website: string,
    phone: string,
    street1: string,
    street2: string,
    city: string,
    state: string,
    zip: string,
    country: string
  ): Promise<ProviderResponse | ErrorResponse> {
    const request = new DataRequest("POST", "providers");

    const body: {
      bio?: string;
      website?: string;
      phone: string;
      address?: {
        street1: string;
        street2: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    } = {
      bio: bio.length === 0 ? undefined : bio,
      website: website.length === 0 ? undefined : website,
      phone,
    };

    if (
      !(
        street1.length === 0 &&
        street2.length === 0 &&
        city.length === 0 &&
        state.length === 0 &&
        zip.length === 0 &&
        country.length === 0
      )
    )
      body.address = {
        street1,
        street2,
        city,
        state,
        zip,
        country,
      };

    request.setBody(body);

    return new Promise((res) => {
      APIManager.sendRequest<ProviderResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as ProviderResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }
}
