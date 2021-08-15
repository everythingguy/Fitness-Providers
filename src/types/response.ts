export interface ResUser {
  _id?: string;
  name: string;
  email: string;
  username: string;
  password?: string;
}

export interface userResponse {
  success: true;
  data?: ResUser;
}

export interface errorResponse {
  success: false;
  error: string[] | string;
}
