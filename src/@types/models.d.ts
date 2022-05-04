import { Types, Document } from "mongoose";
import { WeekDays } from "./enums";

export interface Base extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends Base {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  tokenVersion: number;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  getProvider: () => Promise<Provider>;
  isValidPassword: (password: string) => Promise<boolean>;
}

export interface Provider extends Base {
  user: User | Types.ObjectId;
  address: Address;
  isEnrolled: boolean;
  phone: string;
  bio?: string;
  website?: string;
  tags: Tag[] | Types.ObjectId[];
  getCourses: () => Promise<Course[]>;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Category extends Base {
  name: string;
  tags: Tag[] | Types.ObjectId[];
}

export interface Tag extends Base {
  category: Category | Types.ObjectId;
  value: string;
  appliesToProvider: boolean;
  appliesToCourse: boolean;
}

export interface Course extends Base {
  name: string;
  description: string;
  provider: Provider | Types.ObjectId;
  tags: Tag[] | Types.ObjectId[];
  getSessions: () => Promise<Session[]>;
}

export interface Session extends Base {
  course: Course | Types.ObjectId;
  URL: string;
  name: string;
  liveSession: LiveSession | Types.ObjectId;
}

export interface Recurring {
  weekDays: WeekDays[];
  frequency: Number;
}

export interface LiveSession extends Base {
  session: Session | Types.ObjectId;
  beginDateTime: Date;
  endDateTime: Date;
  recurring: Recurring;
}
