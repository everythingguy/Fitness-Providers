import User from "./User";

interface error {
  msg: string;
}

type Response =
  | {
      success: true;
      user?: User;
    }
  | {
      success: false;
      error: error[] | string;
    };

export default Response;
