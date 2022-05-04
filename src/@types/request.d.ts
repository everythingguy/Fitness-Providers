import { ResUser } from "./response";
import { User, Provider, Course } from "./models";
import { JwtPayload } from "jsonwebtoken";
import express from "express";

interface Request extends express.Request {
  user?: ResUser;
  provider?: Provider;
  payload?: Payload;
  logout: (res: express.Response) => void;
}

interface Payload extends JwtPayload {
  userID: string;
  tokenVersion: number;
}

interface UserRequest extends Request {
  body: User;
}

interface ProviderRequest extends Request {
  body: Provider;
}

interface CourseRequest extends Request {
  body: Course;
}
