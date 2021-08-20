import config from "./config/config.json";
import Response from "./@types/Response";
import User from "./@types/User";
var API_URL = config.API_URL;
if (process.env.NODE_ENV === "production") API_URL = "/api/v1";
export default class API {
  static async createUser(
    name: string,
    email: string,
    username: string,
    password: string
  ): Promise<Response> {
    const jsonData = JSON.stringify({ name, email, username, password });

    var res = await await fetch(API_URL + "/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: jsonData,
    })
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        console.log(err);
      });

    if (res && res.success) {
      return { success: true, user: res.data as User };
    } else {
      return { success: false, error: res.error };
    }
  }

  static async loginUser(
    username: string,
    password: string
  ): Promise<Response> {
    var res = await await fetch(API_URL + "/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error(res.status.toString());
      })
      .catch((err) => {
        console.log(err);
      });

    if (res && res.success) {
      return { success: true, user: res.data };
    } else {
      return { success: false, error: "Unable to login user" };
    }
  }

  static async logoutUser(): Promise<Response> {
    var res = await await fetch(API_URL + "/user/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error(res.status.toString());
      })
      .catch((err) => {
        console.log(err);
      });

    if (res && res.success) {
      return { success: true };
    } else {
      return { success: false, error: "Unable to logout user" };
    }
  }

  static async getUserData(): Promise<Response> {
    var res = await await fetch(API_URL + "/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error(res.status.toString());
      })
      .catch((err) => {
        console.log("User not logged in");
      });

    if (res && res.success) {
      return { success: true, user: res.data };
    } else {
      return { success: false, error: "Unable to get user data" };
    }
  }

  static async isLoggedIn(): Promise<boolean> {
    return (await this.getUserData()).success;
  }
}
