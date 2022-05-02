import * as Model from "./models";

export interface ResUser {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface userResponse {
  success: true;
  data: {
    user?: ResUser;
    accessToken?: string;
  };
}

export interface providerResponse {
  success: true;
  data: {
    provider: Model.Provider;
  };
}

export interface providersResponse {
  success: true;
  data: {
    providers: Model.Provider[];
  };
}

export interface errorResponse {
  success: false;
  error: string[] | string;
}
