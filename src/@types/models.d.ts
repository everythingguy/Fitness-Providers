import { Document } from "mongoose";

export interface User extends Document {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  tokenVersion: number;
  isValidPassword: (password: string) => Promise<boolean>;
}

export interface Provider extends Document {
  user: User;
  address: Address;
  isEnrolled: boolean;
  phone: string;
  bio?: string;
  webiste?: string;
  tags?: Tag[];
}

export interface Address extends Document {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Category extends Document {
  name: string;
  tags: Tag[];
}

export interface Tag extends Document {
  category: Category;
  value: string;
  appliesToProvider: boolean;
  appliesToCourse: boolean;
}

export interface Course extends Document {
  name: string;
  description: string;
  provider: Provider;
  tags: Tag[];
}
