import { UserResponse, ErrorResponse } from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export default class API {
  static async createUser(
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<UserResponse | ErrorResponse> {
    const request = new DataRequest("POST", "users/register");
    request.setBody({ name, email, username, password });

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
        (body) => {
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
    const request = new DataRequest("GET", "users");

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
            APIManager.accessToken = "bearer " + body.data.accessToken;
            res(true);
          } else res(false);
        },
        (body) => res(false),
        false
      );
    });
  }

  static async isLoggedIn(): Promise<boolean> {
    return (await this.getUserData()).success;
  }
}
