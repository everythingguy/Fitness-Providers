import {
  SessionsResponse,
  SessionResponse,
  ErrorResponse,
} from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export class Session {
  static async getProviderSessions(
    providerID: string
  ): Promise<SessionsResponse | ErrorResponse> {
    const request = new DataRequest("GET", "sessions");

    request.setParams({
      provider: providerID,
    });

    return new Promise((res) => {
      APIManager.sendRequest<SessionsResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as SessionsResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }

  static async getCourseSessions(
    courseID: string
  ): Promise<SessionsResponse | ErrorResponse> {
    const request = new DataRequest("GET", "sessions");

    request.setParams({
      course: courseID,
    });

    return new Promise((res) => {
      APIManager.sendRequest<SessionsResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as SessionsResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }

  static async getSessions(): Promise<SessionsResponse | ErrorResponse> {
    const request = new DataRequest("GET", "sessions");

    return new Promise((res) => {
      APIManager.sendRequest<SessionsResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as SessionsResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }
}

export default Session;
