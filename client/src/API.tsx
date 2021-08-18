import config from "./config/config.json";
import { ReturnResponse, Response } from "./types/Response";
var API_URL = config.API_URL;
if (process.env.NODE_ENV === "production") API_URL = "/api/v1";
var accessToken = "";
export default class API {
  static async createUser(
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<ReturnResponse> {
    const jsonData = JSON.stringify({ name, email, username, password });

    var res = await await fetch(API_URL + "/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: jsonData,
    })
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        console.log(err);
      });

    const resp = res as Response;

    if (resp && resp.success && resp.data.user) {
      return { success: true, user: resp.data.user };
    } else {
      return { success: false, error: resp.error };
    }
  }

  static async loginUser(
    username: string,
    password: string
  ): Promise<ReturnResponse> {
    var res = await await fetch(API_URL + "/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: accessToken,
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        console.log(err);
      });

    const resp = res as Response;

    if (resp && resp.success && resp.data.user && resp.data.accessToken) {
      accessToken = "bearer " + resp.data.accessToken;
      return { success: true, user: resp.data.user };
    } else {
      return { success: false, error: resp.error };
    }
  }

  static async logoutUser(first = true): Promise<ReturnResponse> {
    var res = await await fetch(API_URL + "/user/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: accessToken,
      },
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok || !first) return res.json();
        else {
          const authed = await this.refresh_token();
          if (authed) {
            return await this.logoutUser(false);
          }
          return res.json();
        }
      })
      .catch((err) => {
        console.log(err);
      });

    //check if already resolved by catch statement
    const response = res as ReturnResponse;

    if (response && response.success && response.user) return response;

    //resolve the response
    const resp = res as Response;

    if (resp && resp.success && resp.data.user && resp.data.accessToken) {
      accessToken = resp.data.accessToken;
      return { success: true, user: resp.data.user };
    } else {
      return { success: false, error: resp.error };
    }
  }

  static async getUserData(first = true): Promise<ReturnResponse> {
    var res = await await fetch(API_URL + "/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: accessToken,
      },
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok || !first) return res.json();
        else {
          const authed = await this.refresh_token();
          if (authed) {
            return await this.getUserData(false);
          }
          return res.json();
        }
      })
      .catch((err) => {
        console.log(err);
      });

    //check if already resolved by catch statement
    const response = res as ReturnResponse;

    if (response && response.success && response.user) return response;

    //resolve the response
    const resp = res as Response;

    if (resp && resp.success && resp.data.user) {
      return { success: true, user: resp.data.user };
    } else {
      return { success: false, error: resp.error };
    }
  }

  static async refresh_token(): Promise<boolean> {
    var res = await await fetch(API_URL + "/user/refresh_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        console.log("Unable to get new access token");
      });

    const resp = res as Response;

    if (resp && resp.success && resp.data && resp.data.accessToken) {
      accessToken = "bearer " + resp.data.accessToken;
      return true;
    } else {
      return false;
    }
  }

  static async isLoggedIn(): Promise<boolean> {
    return (await this.getUserData()).success;
  }
}
