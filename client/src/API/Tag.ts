import { TagResponse, ErrorResponse } from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export class Tag {
    static async createTag(
        category: string,
        value: string,
        appliesToProvider: boolean,
        appliesToCourse: boolean
    ): Promise<TagResponse | ErrorResponse> {
        const request = new DataRequest("POST", "tags");

        request.setBody({
            category,
            value,
            appliesToProvider,
            appliesToCourse
        });

        return new Promise((res) => {
            APIManager.sendRequest<TagResponse>(
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

    static async getProviderTags(): Promise<TagResponse | ErrorResponse> {
        const request = new DataRequest("GET", "tags");

        request.setParams({
            appliesToProvider: true
        });

        return new Promise((res) => {
            APIManager.sendRequest<TagResponse>(
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

    static async getCourseTags(): Promise<TagResponse | ErrorResponse> {
        const request = new DataRequest("GET", "tags");

        request.setParams({
            appliesToCourse: true
        });

        return new Promise((res) => {
            APIManager.sendRequest<TagResponse>(
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

    static async deleteTag(id: string): Promise<TagResponse | ErrorResponse> {
        const request = new DataRequest("DELETE", `tags/${id}`);

        return new Promise((res) => {
            APIManager.sendRequest<TagResponse>(
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

export default Tag;
