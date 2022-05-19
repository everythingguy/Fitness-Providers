import { ResUser } from "./response";
import * as Model from "./models";
import { JwtPayload } from "jsonwebtoken";
import express from "express";

export interface Request extends express.Request {
  user?: ResUser;
  provider?: Model.Provider;
  payload?: Payload;
  logout: (res: express.Response) => void;
}

export interface SimpleRequestBody<T> extends Request {
  body: T;
}

export interface RequestBody<T extends Model.Base> extends Request {
  body: T;
}

export interface Payload extends JwtPayload {
  userID: string;
  tokenVersion: number;
}
