import { ErrorResponse } from "../@types/Response";
import { APIManager, DataRequest } from "./APIManager";

export default class Mail {
  static async resendConfirmation(username: string) {
    // TODO:
    return { success: true };
  }
}
