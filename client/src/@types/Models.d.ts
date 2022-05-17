import { WeekDays } from "./enums";

interface Base {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address extends Base {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Provider extends Base {
  user: Types.ObjectId;
  address: Types.ObjectId | Address;
  isEnrolled: boolean;
  phone: string;
  bio?: string;
  website?: string;
  tags: Types.ObjectId[];
}

export interface Course extends Base {
  name: string;
  location: Address | Types.ObjectId | "online";
  description: string;
  provider: Provider | Types.ObjectId;
  tags: Tag[] | Types.ObjectId[];
  image?: string;
}

export interface Session extends Base {
  course: Course | Types.ObjectId;
  URL: string;
  name: string;
  image?: string;
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

export interface Tag extends Base {
  category: Types.ObjectId;
  value: string;
  appliesToProvider: boolean;
  appliesToCourse: boolean;
}

export interface Category extends Base {
  name: string;
  tags: Tag[];
}

export default interface User extends Base {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  provider?: Provider;
}
