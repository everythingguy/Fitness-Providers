import { Document } from "mongoose";
import { WeekDays } from "./enums";

export interface Base extends Document {
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
  isValidPassword: (password: string) => Promise<boolean>;
}

export interface Provider extends Base {
  user: User | string;
  address: Address;
  isEnrolled: boolean;
  phone: string;
  bio?: string;
  website?: string;
  tags: Tag[] | string[];
  courses: Course[] | string[];
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
  tags: Tag[] | string[];
}

export interface Tag extends Base {
  category: Category | string;
  value: string;
  appliesToProvider: boolean;
  appliesToCourse: boolean;
}

export interface Course extends Base {
  name: string;
  description: string;
  provider: Provider | string;
  tags: Tag[] | string[];
  sessions: Session[] | string[];
}

export interface Session extends Base {
  course: Course | string;
  URL: string;
  name: string;
  liveSession: LiveSession | string;
}

export interface Recurring {
  weekDays: WeekDays[];
  frequency: Number;
}

export interface LiveSession extends Base {
  beginDateTime: Date;
  endDateTime: Date;
  recurring: Recurring;
}
