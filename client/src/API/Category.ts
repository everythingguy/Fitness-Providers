import {
    CategoriesResponse,
    CategoryResponse,
    ErrorResponse
} from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";
import { Category as CategoryType } from "../@types/Models";

export class Category {
    static async createCategory(
        name: string
    ): Promise<CategoryResponse | ErrorResponse> {
        const request = new DataRequest("POST", "categories");

        request.setBody({ name });

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

    static async getCategories(
        params: { [key: string]: string[] | string | number[] | number } = {}
    ): Promise<CategoriesResponse | ErrorResponse> {
        const request = new DataRequest("GET", "categories");

        request.setParams(params);

        return new Promise((res) => {
            APIManager.sendRequest<CategoriesResponse>(
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

    static async getAllCategories(
        params: { [key: string]: string[] | string | number[] | number } = {}
    ) {
        return APIManager.sendRequestAll<CategoryType>(
            Category.getCategories as any,
            "categories",
            [],
            params
        );
    }

    static async getProviderCategories(): Promise<
        CategoriesResponse | ErrorResponse
    > {
        const request = new DataRequest("GET", "categories");

        request.setParams({
            appliesToProvider: true
        });

        return new Promise((res) => {
            APIManager.sendRequest<CategoriesResponse>(
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
        CategoriesResponse | ErrorResponse
    > {
        const request = new DataRequest("GET", "categories");

        request.setParams({
            appliesToCourse: true
        });

        return new Promise((res) => {
            APIManager.sendRequest<CategoriesResponse>(
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

    static async updateCategory(
        id: string,
        name: string
    ): Promise<CategoryResponse | ErrorResponse> {
        const request = new DataRequest("PATCH", `categories/${id}`);

        request.setBody({
            name
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

    static async deleteCategory(
        id: string
    ): Promise<CategoryResponse | ErrorResponse> {
        const request = new DataRequest("DELETE", `categories/${id}`);

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

export default Category;
