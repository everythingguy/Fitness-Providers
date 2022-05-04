import { ResUser } from "./response";
import * as Model from "./models";
import { JwtPayload } from "jsonwebtoken";
import express from "express";

interface Request extends express.Request {
  user?: ResUser;
  provider?: Model.Provider;
  payload?: Payload;
  logout: (res: express.Response) => void;
}

interface Payload extends JwtPayload {
  userID: string;
  tokenVersion: number;
}

interface UserRequest extends Request {
  body: Model.User;
}

interface ProviderRequest extends Request {
  body: Model.Provider;
}

interface CourseRequest extends Request {
  body: Model.Course;
}

interface SessionRequest extends Request {
  body: Model.Session;
}
