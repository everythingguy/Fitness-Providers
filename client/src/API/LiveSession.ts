import {
    LiveSessionsResponse,
    LiveSessionResponse,
    ErrorResponse
} from "../@types/Response";
import Session from "./Session";
import { Session as SessionType } from "../@types/Models";
import { APIManager, DataRequest } from "./APIManager";
import { WeekDays } from "../@types/enums";

export class LiveSession {
    static async createLiveSession(
        session: string,
        beginDateTime: Date | null,
        endDateTime: Date | null,
        recurring?: { weekDays: WeekDays[]; frequency: number }
    ): Promise<LiveSessionResponse | ErrorResponse> {
        const request = new DataRequest("POST", "live-sessions");

        const body = {
            session,
            beginDateTime,
            endDateTime,
            recurring
        };

        if (!recurring) delete body.recurring;

        request.setBody(body);

        return new Promise((res) => {
            APIManager.sendRequest<LiveSessionResponse>(
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

    static async updateLiveSession(
        id: string,
        session: string,
        beginDateTime: Date | null,
        endDateTime: Date | null,
        recurring?: { weekDays: WeekDays[]; frequency: number } | null
    ): Promise<LiveSessionResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `live-sessions/${id}`);

        const body = {
            session,
            beginDateTime,
            endDateTime,
            recurring
        };

        if (recurring === undefined) delete body.recurring;

        request.setBody(body);

        return new Promise((res) => {
            APIManager.sendRequest<LiveSessionResponse>(
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

    static async getLiveSession(
        id: string
    ): Promise<LiveSessionResponse | ErrorResponse> {
        const request = new DataRequest("GET", `live-sessions/${id}`);

        return new Promise((res) => {
            APIManager.sendRequest<LiveSessionResponse>(
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

    static async getLiveSessions(
        params: { [key: string]: any } = {}
    ): Promise<LiveSessionsResponse | ErrorResponse> {
        const request = new DataRequest("GET", "live-sessions");

        request.setParams(params);

        return new Promise((res) => {
            APIManager.sendRequest<LiveSessionsResponse>(
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

    static async getAllProviderLiveSessions(
        providerID: string,
        params: { [key: string]: string[] | string | number[] | number } = {}
    ): Promise<SessionType[]> {
        let page = 1;
        const sessions: SessionType[] = [];

        return new Promise((res) => {
            const cb = (resp) => {
                if (resp.success) {
                    for (const s of resp.data.sessions) sessions.push(s);
                    if (resp.hasNextPage) {
                        page++;
                        Session.getProviderSessions(providerID, {
                            ...params,
                            page,
                            live: true
                        }).then((response) => cb(response));
                    } else res(sessions);
                } else res(sessions);
            };

            Session.getProviderSessions(providerID, {
                ...params,
                page,
                live: true
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
                    res(resp);
                },
                (resp) => {
                    res(resp);
                }
            );
        });
    }
}

export default LiveSession;
