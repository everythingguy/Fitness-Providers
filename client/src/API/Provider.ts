import { ProviderResponse, ErrorResponse } from "../@types/Response";
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
      phone,
    });

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

  static async setAddress(
    providerID: string,
    addressID: string
  ): Promise<ProviderResponse | ErrorResponse> {
    const request = new DataRequest("PATCH", `providers/${providerID}`);

    request.setBody({
      address: addressID,
    });

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

export default Provider;
