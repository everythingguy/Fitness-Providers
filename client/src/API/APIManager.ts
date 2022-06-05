import {
    BaseResponse,
    ErrorResponse,
    ImageResponse,
    SuccessfulPaginationResponse
} from "../@types/Response";
import User from "./User";
import ReqBody from "./../@types/ReqBody.d";
import { Base } from "../@types/Models";
const API_URL = process.env.API_URL;

export class DataRequest {
    requestType: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    endpoint: string;
    params: { [key: string]: any };
    body: { [key: string]: any };

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
    setBody(body: { [key: string]: any }) {
        this.body = body;
    }

    /**
     * Set the parameters to be used in a get request. Ex: {search: 'mySearchTerm', page: 2}.
     */
    setParams(params: { [key: string]: any }) {
        this.params = params;
    }

    /**
     * Set more parameters without removing existing parameters. Can be used with: setSeachTerm, setOrdering, setPage.
     */
    addParams(params: { [key: string]: string | number }) {
        this.params = {
            ...this.params,
            ...params
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
                if (dataRequest.params[param] !== undefined) {
                    let data = dataRequest.params[param];
                    if (Array.isArray(data)) data = data.join();

                    if (firstParam) {
                        paramString += `?${param}=${data}`;
                        firstParam = false;
                    } else paramString += `&${param}=${data}`;
                }
            }

            const reqBody: ReqBody = {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                credentials: "include",
                method: dataRequest.requestType
            };

            if (Object.keys(dataRequest.body).length !== 0)
                reqBody.body = JSON.stringify(dataRequest.body);

            if (this.accessToken && this.accessToken.length > 0)
                reqBody.headers.Authorization = this.accessToken;

            const res = await fetch(
                `${API_URL}/${dataRequest.endpoint}${paramString}`,
                reqBody
            );

            const tryAgainErrorCodes = [401, 403];

            if (!res.ok && first && tryAgainErrorCodes.includes(res.status)) {
                const authed = await User.refresh_token();
                if (authed)
                    return this.sendRequest(
                        dataRequest,
                        onSuccess,
                        onFail,
                        false
                    );
            }

            const body: T = await res.json();

            if (body.error && onFail) {
                const errorBody = body as ErrorResponse;
                onFail(errorBody);
            } else if (!body.error && onSuccess) onSuccess(body);

            return body;
        } catch (error: any) {
            const body: ErrorResponse = {
                success: false,
                error: error.message
            };
            if (onFail) onFail(body);
            return body;
        }
    }

    static async sendRequestAll<T extends Base>(
        API: (
            ...args: [
                ...any,
                { [key: string]: string[] | string | number[] | number }
            ]
        ) => Promise<SuccessfulPaginationResponse | ErrorResponse>,
        modelName: string,
        args: any[] = [],
        params: { [key: string]: string[] | string | number[] | number } = {}
    ): Promise<T[]> {
        let page = 1;
        const results: T[] = [];

        return new Promise((res) => {
            const cb = (resp: SuccessfulPaginationResponse | ErrorResponse) => {
                if (resp.success && resp.data) {
                    for (const result of resp.data[modelName] as T[])
                        results.push(result);
                    if (resp.hasNextPage) {
                        page++;
                        API(...args, { ...params, page }).then((response) =>
                            cb(response)
                        );
                    } else res(results);
                } else res(results);
            };

            API(...args, { ...params, page }).then((response) => cb(response));
        });
    }

    static async uploadImage(
        endpoint: string,
        file: File,
        onSuccess?: (body: ImageResponse) => void,
        onFail?: (error: ErrorResponse) => void
    ): Promise<ImageResponse | ErrorResponse> {
        const formData = new FormData();
        formData.append("image", file, file.name);

        const options: any = {
            headers: {
                Accept: "application/json"
            },
            method: "PATCH",
            credentials: "include",
            body: formData
        };

        if (this.accessToken && this.accessToken.length > 0)
            options.headers.Authorization = this.accessToken;

        try {
            const resp = await fetch(`${API_URL}/${endpoint}`, options);
            const body = await resp.json();

            if (body.error && onFail) {
                const errorBody = body as ErrorResponse;
                onFail(errorBody);
            } else if (!body.error && onSuccess)
                onSuccess(body as ImageResponse);

            return body;
        } catch (error: any) {
            const body: ErrorResponse = {
                success: false,
                error: error.message
            };
            if (onFail) onFail(body);
            return body;
        }
    }
}
