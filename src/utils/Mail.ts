import { User } from "../@types/models";

export async function sendConfirmation(user: User): Promise<boolean> {
  // TODO:
  return new Promise((res, rej) => {
    res(false);
  });
}

export async function forgotPassword(user: User): Promise<boolean> {
  // TODO:
  // use the temporaryCode model to create the temp code for the url
  return new Promise((res, rej) => {
    res(false);
  });
}
