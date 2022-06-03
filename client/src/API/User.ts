import {
    UserResponse,
    ErrorResponse,
    SuccessfulResponse
} from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export class User {
    static async createUser(
        firstName: string,
        lastName: string,
        email: string,
        username: string,
        password: string,
        confirmPassword: string
    ): Promise<UserResponse | ErrorResponse> {
        const request = new DataRequest("POST", "users/register");
        request.setBody({
            firstName,
            lastName,
            email,
            username,
            password,
            re_password: confirmPassword
        });

        return new Promise((res) => {
            APIManager.sendRequest<UserResponse>(
                request,
                (body) => {
                    res({ success: true, data: body.data } as UserResponse);
                },
                (body) => {
                    res({ success: false, error: body.error } as ErrorResponse);
                }
            );
        });
    }

    static async resendConfirmation(
        username: string
    ): Promise<{ success: true } | ErrorResponse> {
        const request = new DataRequest("POST", "users/resendConfirmation");
        request.setBody({ username });

        return new Promise((res) => {
            APIManager.sendRequest<UserResponse>(
                request,
                () => {
                    res({ success: true });
                },
                (body) => {
                    res({ success: false, error: body.error } as ErrorResponse);
                }
            );
        });
    }

    static async loginUser(
        username: string,
        password: string
    ): Promise<UserResponse | ErrorResponse> {
        const request = new DataRequest("POST", "users/login");
        request.setBody({ username, password });

        return new Promise((res) => {
            APIManager.sendRequest<UserResponse>(
                request,
                (body) => {
                    APIManager.accessToken = "bearer " + body.data.accessToken;

                    res({ success: true, data: body.data } as UserResponse);
                },
                (body) => {
                    res({ success: false, error: body.error } as ErrorResponse);
                }
            );
        });
    }

    static async logoutUser(): Promise<UserResponse | ErrorResponse> {
        const request = new DataRequest("POST", "users/logout");

        return new Promise((res) => {
            APIManager.sendRequest<UserResponse>(
                request,
                (body) => {
                    APIManager.accessToken = "" + body.data.accessToken;

                    res({ success: true, data: body.data } as UserResponse);
                },
                (body) => {
                    res({ success: false, error: body.error } as ErrorResponse);
                }
            );
        });
    }

    static async getUserData(): Promise<UserResponse | ErrorResponse> {
        const request = new DataRequest("GET", "users/me");

        return new Promise((res) => {
            APIManager.sendRequest<UserResponse>(
                request,
                (body) => {
                    res({ success: true, data: body.data } as UserResponse);
                },
                (body) => {
                    res({ success: false, error: body.error } as ErrorResponse);
                }
            );
        });
    }

    static async updateUser(
        id: string,
        body: {
            [key: string]: any;
        }
    ): Promise<UserResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `users/${id}`);

        request.setBody(body);

        return new Promise((res) => {
            APIManager.sendRequest<UserResponse>(
                request,
                (body) => {
                    res({ success: true, data: body.data } as UserResponse);
                },
                (body) => {
                    res({ success: false, error: body.error } as ErrorResponse);
                }
            );
        });
    }

    static async refresh_token(): Promise<boolean> {
        const request = new DataRequest("POST", "users/refresh_token");

        return new Promise((res) => {
            APIManager.sendRequest<UserResponse>(
                request,
                (body) => {
                    if (body.data.accessToken) {
                        APIManager.accessToken =
                            "bearer " + body.data.accessToken;
                        res(true);
                    } else res(false);
                },
                () => res(false),
                false
            );
        });
    }

    static async forgotPassword(
        email
    ): Promise<SuccessfulResponse | ErrorResponse> {
        const request = new DataRequest("POST", "users/password/forgot");

        request.setBody({
            email
        });

        return new Promise((res) => {
            APIManager.sendRequest<SuccessfulResponse>(
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

    static async changePassword({
        currentPassword,
        password,
        re_password
    }: {
        currentPassword: string;
        password: string;
        re_password: string;
    }): Promise<UserResponse | ErrorResponse> {
        const request = new DataRequest("POST", "users/password/change");

        request.setBody({
            currentPassword,
            password,
            re_password
        });

        return new Promise((res) => {
            APIManager.sendRequest<UserResponse>(
                request,
                (body) => {
                    res({ success: true, data: body.data } as UserResponse);
                },
                (body) => {
                    res({ success: false, error: body.error } as ErrorResponse);
                }
            );
        });
    }

    static async isLoggedIn(): Promise<boolean> {
        return (await this.getUserData()).success;
    }
}

export default User;
