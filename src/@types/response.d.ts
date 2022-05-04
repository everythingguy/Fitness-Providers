import * as Model from "./models";
import { Types } from "mongoose";

export interface ResUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  provider?: Model.Provider;
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

export interface courseResponse {
  success: true;
  data: {
    course: Model.Course;
  };
}

export interface coursesResponse {
  success: true;
  data: {
    courses: Model.Course[];
  };
}

export interface sessionResponse {
  success: true;
  data: {
    session: Model.Session;
  };
}

export interface sessionsResponse {
  success: true;
  data: {
    sessions: Model.Session[];
  };
}

export interface liveSessionResponse {
  success: true;
  data: {
    liveSession: Model.LiveSession;
  };
}

export interface liveSessionsResponse {
  success: true;
  data: {
    liveSessions: Model.LiveSession[];
  };
}

export interface errorResponse {
  success: false;
  error: string[] | string;
}
