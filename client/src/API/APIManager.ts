import { BaseResponse, ErrorResponse } from "../@types/Response";
import User from "./User";
const API_URL = process.env.API_URL;

export class DataRequest {
  requestType: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  params: { [key: string]: string | number };
  body: { [key: string]: string | number };

  /**
   * @desc DataRequest is a class used to define the parameters of an API request.
   * After creating a DataRequest object, the request can be sent with APIManager.sendRequest(dataRequest).
   * @param requestType The method to use for the request. Ex: 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'.
   * @param endpoint The API endpoint the request should be sent to.
   */
  constructor(
    requestType: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string
  ) {
    this.requestType = requestType;
    this.endpoint = endpoint;
    this.params = {};
    this.body = {};
  }

  /**
   * @desc Set the body to be used in post, put, patch, delete requests. Ex: {username: 'myUsername', password: 'myPassword'}.
   */
  setBody(body) {
    this.body = body;
  }

  /**
   * Set the parameters to be used in a get request. Ex: {search: 'mySearchTerm', page: 2}.
   */
  setParams(params) {
    this.params = params;
  }

  /**
   * Set more parameters without removing existing parameters. Can be used with: setSeachTerm, setOrdering, setPage.
   */
  addParams(params) {
    this.params = {
      ...this.params,
      ...params,
    };
  }
}

export class APIManager {
  static accessToken = "";

  /**
   * Sends an API request based on the DataRequest passed in.
   * Can optionally include onSuccess and onFail methods that will be executed depending on if the request succeeded.
   * @param dataRequest The DataRequest object that defines the request.
   * @param onSuccess A callback method that will be called with the response object if the request succeeded.
   * @param onFail A callback method that will be called with an error object if the request failed.
   * @returns The API response of the request succeeded.
   */
  static async sendRequest<T extends BaseResponse>(
    dataRequest: DataRequest,
    onSuccess?: (body: T) => void,
    onFail?: (error: ErrorResponse) => void,
    first = true
  ): Promise<T | ErrorResponse> {
    try {
      let paramString = "";
      let firstParam = true;

      for (const param in dataRequest.params) {
        if (dataRequest.params[param]) {
          if (firstParam) {
            paramString += `?${param}=${dataRequest.params[param]}`;
            firstParam = false;
          } else paramString += `&${param}=${dataRequest.params[param]}`;
        }
      }

      const res = await fetch(
        `${API_URL}/${dataRequest.endpoint}${paramString}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: this.accessToken,
          },
          credentials: "include",
          method: dataRequest.requestType,
          body: JSON.stringify(dataRequest.body),
        }
      );

      const tryAgainErrorCodes = [401, 403];

      if (
        !res.ok &&
        first &&
        this.accessToken.length > 0 &&
        tryAgainErrorCodes.includes(res.status)
      ) {
        const authed = await User.refresh_token();
        if (authed)
          return this.sendRequest(dataRequest, onSuccess, onFail, false);
      }

      const body: T = await res.json();

      if (body.error && onFail) {
        const errorBody = body as ErrorResponse;
        onFail(errorBody);
      } else if (!body.error && onSuccess) onSuccess(body);

      return body;
    } catch (error) {
      const body: ErrorResponse = { success: false, error: "" };
      if (onFail) onFail(body);
      return body;
    }
  }
}
