import {
  LiveSessionsResponse,
  LiveSessionResponse,
  ErrorResponse,
} from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export class LiveSession {
  static async getLiveSessions(): Promise<LiveSessionResponse | ErrorResponse> {
    const request = new DataRequest("GET", "liveSessions");

    return new Promise((res) => {
      APIManager.sendRequest<LiveSessionResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as LiveSessionResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }

  static async deleteLiveSession(
    id: string
  ): Promise<LiveSessionResponse | ErrorResponse> {
    const request = new DataRequest("DELETE", `liveSessions/${id}`);

    return new Promise((res) => {
      APIManager.sendRequest<LiveSessionResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as LiveSessionResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }
}

export default LiveSession;
