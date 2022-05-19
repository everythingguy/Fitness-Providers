import {
  SessionsResponse,
  SessionResponse,
  ErrorResponse,
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
      provider: providerID,
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
      course: courseID,
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
    [key: string]: string[] | string | number[] | number | boolean;
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
    URL: string,
    name: string,
    course?: string
  ): Promise<SessionResponse | ErrorResponse> {
    const request = new DataRequest("POST", "sessions");

    request.setBody({
      course,
      URL: URL && URL.length > 0 ? URL : undefined,
      name,
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
    URL: string,
    name: string,
    course?: string
  ): Promise<SessionResponse | ErrorResponse> {
    const request = new DataRequest("PATCH", `sessions/${id}`);

    request.setBody({ course, URL, name });

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
}

export default Session;
