import { CategoryResponse, ErrorResponse } from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export default class API {
  static async getProviderCategories(): Promise<
    CategoryResponse | ErrorResponse
  > {
    const request = new DataRequest("GET", "categories");

    request.setParams({
      appliesToProvider: true,
    });

    return new Promise((res) => {
      APIManager.sendRequest<CategoryResponse>(
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

  static async getCourseCategories(): Promise<
    CategoryResponse | ErrorResponse
  > {
    const request = new DataRequest("GET", "categories");

    request.setParams({
      appliesToCourse: true,
    });

    return new Promise((res) => {
      APIManager.sendRequest<CategoryResponse>(
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
