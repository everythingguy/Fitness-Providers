import { Document } from "mongoose";

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
  user: User;
  address: Address;
  isEnrolled: boolean;
  phone: string;
  bio?: string;
  webiste?: string;
  tags?: Tag[];
  courses: Course[];
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
  tags: Tag[];
}

export interface Tag extends Base {
  category: Category;
  value: string;
  appliesToProvider: boolean;
  appliesToCourse: boolean;
}

export interface Course extends Base {
  name: string;
  description: string;
  provider: Provider;
  tags: Tag[];
  sessions: Session[];
}

export interface Session extends Base {
  course: Course;
  URL: string;
  name: string;
  liveSession: LiveSession;
}

export enum WeekDays {
  Sunday = "Sunday",
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
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
