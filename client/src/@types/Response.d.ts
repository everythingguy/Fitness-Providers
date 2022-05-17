import User, { Provider, Address, Course, Category, Tag } from "./Models";

export interface BaseResponse {
  success: boolean;
  data?: { [key: any]: any };
  error?: string | string[];
}

export interface SuccessfulResponse extends BaseResponse {
  success: true;
  data: { [key: any]: any };
  error?: undefined;
}

export interface UserResponse extends SuccessfulResponse {
  data: {
    user?: User;
    accessToken?: string;
  };
}

export interface ProviderResponse extends SuccessfulResponse {
  data: {
    provider: Provider;
  };
}

export interface AddressResponse extends SuccessfulResponse {
  data: {
    address: Address;
  };
}

export interface AddressesResponse extends SuccessfulResponse {
  data: {
    addresses: Address[];
  };
}

export interface CourseResponse extends SuccessfulResponse {
  data: {
    course: Course;
  };
}

export interface CoursesResponse extends SuccessfulResponse {
  data: {
    courses: Course[];
  };
}

export interface CategoryResponse extends SuccessfulResponse {
  data: {
    categories: Category[];
  };
}

export interface TagResponse extends SuccessfulResponse {
  data: {
    tags: Tag[];
  };
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  data?: undefined;
  error: string | string[] | { [key: string]: string };
}
