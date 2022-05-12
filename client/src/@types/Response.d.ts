import User from "./User";

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

export interface ErrorResponse extends BaseResponse {
  success: false;
  data?: undefined;
  error: string | string[] | { [key: string]: string };
}
