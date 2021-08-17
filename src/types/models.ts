import { Document } from "mongoose";

export interface User extends Document {
  name: string;
  email: string;
  username: string;
  password?: string;
  tokenVersion: number;
  isValidPassword: (password: string) => Promise<boolean>;
}
