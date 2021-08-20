import User from "./User";

interface error {
  msg: string;
}

export type Response =
  | {
      success: true;
      data: {
        user?: User;
        accessToken?: string;
      };
      [other: string]: any;
    }
  | {
      success: false;
      error: error[] | string;
      [other: string]: any;
    };

export type ReturnResponse =
  | {
      success: true;
      user: User;
    }
  | {
      success: false;
      error: error[] | string;
    };
