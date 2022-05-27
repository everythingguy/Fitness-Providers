import { Types, Document } from "mongoose";
import { WeekDays } from "./enums";

export interface Base extends Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface Image extends Base {
    image: string | null;
}

export interface PasswordResetCode extends Base {
    code: string;
    user: Types.ObjectId;
}

export interface User extends Base {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    emailConfirmed: boolean;
    username: string;
    password?: string;
    tokenVersion: number;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    getProvider: () => Promise<Provider>;
    isValidPassword: (password: string) => Promise<boolean>;
}

export interface Provider extends Image {
    user: User | Types.ObjectId;
    address: Address | Types.ObjectId;
    isEnrolled: boolean;
    phone: string;
    bio?: string;
    website?: string;
    tags: Tag[] | Types.ObjectId[];
    getCourses: () => Promise<Course[]>;
}

export interface Address extends Base {
    provider: Provider | Types.ObjectId;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    googlePlaceID: string | null;
    coordinates: {
        latitude: number;
        longitude: number;
    } | null;
}

export interface Category extends Base {
    name: string;
    getTags: () => Tag[];
}

export interface Tag extends Base {
    category: Category | Types.ObjectId;
    value: string;
    appliesToProvider: boolean;
    appliesToCourse: boolean;
}

export interface Course extends Image {
    name: string;
    location: Address | Types.ObjectId | "online";
    description: string;
    provider: Provider | Types.ObjectId;
    tags: Tag[] | Types.ObjectId[];
    getSessions: () => Promise<Session[]>;
}

export interface Session extends Image {
    course: Course | Types.ObjectId;
    URL?: string;
    name: string;
    liveSession: LiveSession | Types.ObjectId;
}

export interface Recurring {
    weekDays: WeekDays[];
    frequency: number;
}

export interface LiveSession extends Base {
    session: Session | Types.ObjectId;
    beginDateTime: Date;
    endDateTime: Date;
    recurring: Recurring;
}
