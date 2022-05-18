import {
  CoursesResponse,
  CourseResponse,
  ErrorResponse,
} from "../@types/Response";
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
      tags,
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
    providerID: string
  ): Promise<CoursesResponse | ErrorResponse> {
    const request = new DataRequest("GET", "courses");

    request.setParams({
      provider: providerID,
    });

    return new Promise((res) => {
      APIManager.sendRequest<CoursesResponse>(
        request,
        (resp) => {
          res({ success: true, data: resp.data } as CoursesResponse);
        },
        (resp) => {
          res({ success: false, error: resp.error } as ErrorResponse);
        }
      );
    });
  }

  static async getCourse(id: string): Promise<CourseResponse | ErrorResponse> {
    const request = new DataRequest("GET", `courses/${id}`);

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
      tags,
    };

    if (location === "online") body.location = null;

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

  static async deleteCourse(
    id: string
  ): Promise<CourseResponse | ErrorResponse> {
    const request = new DataRequest("DELETE", `courses/${id}`);

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
}

export default Course;
