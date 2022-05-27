import {
    SessionsResponse,
    SessionResponse,
    ErrorResponse,
    ImageResponse
} from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export class Session {
    static async getProviderSessions(
        providerID: string,
        params: {
            [key: string]: string[] | string | number[] | number | boolean;
        } = {}
    ): Promise<SessionsResponse | ErrorResponse> {
        const request = new DataRequest("GET", "sessions");

        request.setParams({
            ...params,
            provider: providerID
        });

        return new Promise((res) => {
            APIManager.sendRequest<SessionsResponse>(
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

    static async getCourseSessions(
        courseID: string,
        params: {
            [key: string]: string[] | string | number[] | number | boolean;
        } = {}
    ): Promise<SessionsResponse | ErrorResponse> {
        const request = new DataRequest("GET", "sessions");

        request.setParams({
            ...params,
            course: courseID
        });

        return new Promise((res) => {
            APIManager.sendRequest<SessionsResponse>(
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

    static async getSessions(params?: {
        [key: string]: any;
    }): Promise<SessionsResponse | ErrorResponse> {
        const request = new DataRequest("GET", "sessions");

        if (params) request.setParams(params);

        return new Promise((res) => {
            APIManager.sendRequest<SessionsResponse>(
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

    static async createSession(
        name: string,
        URL?: string,
        course?: string
    ): Promise<SessionResponse | ErrorResponse> {
        const request = new DataRequest("POST", "sessions");

        const body = { course, URL, name };

        if (!course) delete body.course;
        if (!(URL && URL.length > 0)) delete body.URL;

        request.setBody(body);

        return new Promise((res) => {
            APIManager.sendRequest<SessionResponse>(
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

    static async getSession(
        id: string
    ): Promise<SessionResponse | ErrorResponse> {
        const request = new DataRequest("GET", `sessions/${id}`);

        return new Promise((res) => {
            APIManager.sendRequest<SessionResponse>(
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

    static async updateSession(
        id: string,
        name: string,
        URL?: string,
        course?: string
    ): Promise<SessionResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `sessions/${id}`);

        const body = { course, URL, name };

        if (!course) delete body.course;
        if (!(URL && URL.length > 0)) delete body.URL;

        request.setBody(body);

        return new Promise((res) => {
            APIManager.sendRequest<SessionResponse>(
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

    static async deleteSession(
        id: string
    ): Promise<SessionResponse | ErrorResponse> {
        const request = new DataRequest("DELETE", `sessions/${id}`);

        return new Promise((res) => {
            APIManager.sendRequest<SessionResponse>(
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

    static async uploadImage(
        id: string,
        file: File
    ): Promise<ImageResponse | ErrorResponse> {
        return new Promise((res) => {
            APIManager.uploadImage(
                `sessions/${id}/image`,
                file,
                (resp) => res(resp),
                (resp) => res(resp)
            );
        });
    }

    static async removeImage(
        id: string
    ): Promise<SessionResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `sessions/${id}`);

        request.setBody({
            image: null
        });

        return new Promise((res) => {
            APIManager.sendRequest<SessionResponse>(
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

export default Session;
