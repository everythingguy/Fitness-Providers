export interface ResUser {
  _id: string;
  name: string;
  email: string;
  username: string;
}

export interface userResponse {
  success: true;
  data: {
    user?: ResUser;
    accessToken?: string;
  };
}

export interface errorResponse {
  success: false;
  error: string[] | string;
}
