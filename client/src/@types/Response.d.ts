import User, {
  Provider,
  Address,
  Course,
  Session,
  LiveSession,
  Category,
  Tag,
} from "./Models";

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

export interface SuccessfulPaginationResponse extends SuccessfulResponse {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: string | null;
  nextPage: string | null;
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

export interface AddressesResponse extends SuccessfulPaginationResponse {
  data: {
    addresses: Address[];
  };
}

export interface CourseResponse extends SuccessfulResponse {
  data: {
    course: Course;
  };
}

export interface CoursesResponse extends SuccessfulPaginationResponse {
  data: {
    courses: Course[];
  };
}

export interface SessionResponse extends SuccessfulResponse {
  data: {
    session: Session;
  };
}

export interface SessionsResponse extends SuccessfulPaginationResponse {
  data: {
    sessions: Session[];
  };
}

export interface LiveSessionResponse extends SuccessfulResponse {
  data: {
    liveSession: LiveSession;
  };
}

export interface LiveSessionsResponse extends SuccessfulPaginationResponse {
  data: {
    liveSessions: LiveSession[];
  };
}

export interface CategoryResponse extends SuccessfulPaginationResponse {
  data: {
    categories: Category[];
  };
}

export interface TagResponse extends SuccessfulPaginationResponse {
  data: {
    tags: Tag[];
  };
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  data?: undefined;
  error: string | string[] | { [key: string]: string };
}
