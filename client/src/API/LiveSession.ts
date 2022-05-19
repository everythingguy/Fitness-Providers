import {
  LiveSessionsResponse,
  LiveSessionResponse,
  ErrorResponse,
} from "../@types/Response";
import Session from "./Session";
import { Session as SessionType } from "../@types/Models";
import { APIManager, DataRequest } from "./APIManager";

export class LiveSession {
  static async getLiveSessions(): Promise<LiveSessionResponse | ErrorResponse> {
    const request = new DataRequest("GET", "live-sessions");

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

  static async getAllProviderLiveSessions(
    providerID: string,
    params: { [key: string]: string[] | string | number[] | number } = {}
  ): Promise<SessionType[]> {
    let page = 1;
    const sessions: SessionType[] = [];

    return new Promise((res) => {
      const cb = (resp, first = true) => {
        if (resp.success) {
          for (const s of resp.data.sessions) sessions.push(s);
          if (resp.hasNextPage) {
            page++;
            Session.getProviderSessions(providerID, {
              ...params,
              page,
              live: true,
            }).then((response) => cb(response, false));
          } else res(sessions);
        } else res(sessions);
      };

      Session.getProviderSessions(providerID, {
        ...params,
        page,
        live: true,
      }).then((resp) => cb(resp));
    });
  }

  static async deleteLiveSession(
    id: string
  ): Promise<LiveSessionResponse | ErrorResponse> {
    const request = new DataRequest("DELETE", `live-sessions/${id}`);

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
