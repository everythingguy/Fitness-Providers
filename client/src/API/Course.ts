import {
    CoursesResponse,
    CourseResponse,
    ErrorResponse,
    ImageResponse
} from "../@types/Response";
import { Course as CourseType } from "../@types/Models";
import { APIManager, DataRequest } from "./APIManager";

export class Course {
    static async createCourse(
        name: string,
        description: string,
        tags: string[],
        location?: string | "online"
    ): Promise<CourseResponse | ErrorResponse> {
        const request = new DataRequest("POST", "courses");
        const body = {
            name,
            description,
            location,
            tags
        };

        if (location === "online") delete body.location;

        request.setBody(body);

        return new Promise((res) => {
            APIManager.sendRequest<CourseResponse>(
                request,
                (resp) => {
                    res({ success: true, data: resp.data } as CourseResponse);
                },
                (resp) => {
                    res({ success: false, error: resp.error } as ErrorResponse);
                }
            );
        });
    }

    static async getProvidersCourses(
        providerID: string,
        params: { [key: string]: string[] | string | number[] | number } = {}
    ): Promise<CoursesResponse | ErrorResponse> {
        const request = new DataRequest("GET", "courses");

        request.setParams({
            ...params,
            provider: providerID
        });

        return new Promise((res) => {
            APIManager.sendRequest<CoursesResponse>(
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

    static async getAllProvidersCourses(
        providerID: string,
        params: { [key: string]: string[] | string | number[] | number } = {}
    ): Promise<CourseType[]> {
        return APIManager.sendRequestAll<CourseType>(
            Course.getProvidersCourses as any,
            "courses",
            [providerID],
            params
        );
    }

    static async getCourses(params?: {
        [key: string]: any;
    }): Promise<CoursesResponse | ErrorResponse> {
        const request = new DataRequest("GET", "courses");

        if (params) request.setParams(params);

        return new Promise((res) => {
            APIManager.sendRequest<CoursesResponse>(
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

    static async getCourse(
        id: string
    ): Promise<CourseResponse | ErrorResponse> {
        const request = new DataRequest("GET", `courses/${id}`);

        return new Promise((res) => {
            APIManager.sendRequest<CourseResponse>(
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

    static async updateCourse(
        id: string,
        name: string,
        description: string,
        tags: string[],
        location: string | "online" | null
    ): Promise<CourseResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `courses/${id}`);

        const body = {
            name,
            description,
            location,
            tags
        };

        if (location === "online") body.location = null;

        request.setBody(body);

        return new Promise((res) => {
            APIManager.sendRequest<CourseResponse>(
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

    static async deleteCourse(
        id: string
    ): Promise<CourseResponse | ErrorResponse> {
        const request = new DataRequest("DELETE", `courses/${id}`);

        return new Promise((res) => {
            APIManager.sendRequest<CourseResponse>(
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

    static async uploadImage(
        id: string,
        file: File
    ): Promise<ImageResponse | ErrorResponse> {
        return new Promise((res) => {
            APIManager.uploadImage(
                `courses/${id}/image`,
                file,
                (resp) => res(resp),
                (resp) => res(resp)
            );
        });
    }

    static async removeImage(
        id: string
    ): Promise<CourseResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `courses/${id}`);

        request.setBody({
            image: null
        });

        return new Promise((res) => {
            APIManager.sendRequest<CourseResponse>(
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

export default Course;
