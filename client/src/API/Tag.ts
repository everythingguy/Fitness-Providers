import { TagResponse, ErrorResponse } from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export default class API {
  static async getProviderTags(): Promise<TagResponse | ErrorResponse> {
    const request = new DataRequest("GET", "tags");

    request.setParams({
      appliesToProvider: true,
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
      appliesToCourse: true,
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
}
