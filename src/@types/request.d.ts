import { ResUser } from "./response";
import { User, Provider } from "./models";
import { JwtPayload } from "jsonwebtoken";
import express from "express";

interface Request extends express.Request {
  user?: ResUser;
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
  body: Omit<Provider, "user" | "tags" | "courses"> & {
    user: string;
  };
}

interface FullProviderRequest extends Request {
  body: Provider;
}
