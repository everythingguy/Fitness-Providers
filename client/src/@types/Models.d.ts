import { WeekDays } from "./enums";

interface Base {
  _id: string;
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
  user: string;
  address: Address | string;
  isEnrolled: boolean;
  phone: string;
  bio?: string;
  website?: string;
  tags: string[];
}

export interface Course extends Base {
  name: string;
  location?: Address | string;
  description: string;
  provider: Provider | string;
  tags: Tag[] | string[];
  image?: string;
}

export interface Session extends Base {
  course: Course | string;
  URL?: string;
  name: string;
  image?: string;
  liveSession: LiveSession | string;
}

export interface Recurring {
  weekDays: WeekDays[];
  frequency: Number;
}

export interface LiveSession extends Base {
  session: Session | string;
  beginDateTime: Date;
  endDateTime: Date;
  recurring: Recurring;
}

export interface Tag extends Base {
  category: Category | string;
  value: string;
  appliesToProvider: boolean;
  appliesToCourse: boolean;
}

export interface Category extends Base {
  name: string;
  tags: Tag[] | string;
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
