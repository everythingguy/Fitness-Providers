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
    user: ProviderUser;
    address: Address;
    isEnrolled: boolean;
    phone: string;
    image?: string;
    bio?: string;
    website?: string;
    tags: string[];
}

export interface Course extends Base {
    name: string;
    location?: Address;
    description: string;
    provider: Provider;
    tags: Tag[];
    image?: string;
}

export interface Session extends Base {
    course: Course;
    URL?: string;
    name: string;
    image?: string;
    liveSession: LiveSession;
}

export interface Recurring {
    weekDays: WeekDays[];
    frequency: number;
}

export interface LiveSession extends Base {
    session: Session;
    beginDateTime: Date;
    endDateTime: Date;
    recurring: Recurring;
}

export interface Tag extends Base {
    category: Category;
    value: string;
    appliesToProvider: boolean;
    appliesToCourse: boolean;
}

export interface Category extends Base {
    name: string;
    tags: Tag[];
}

export default interface ProviderUser extends Base {
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    username: string;
}

export default interface User extends ProviderUser {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    provider?: Provider;
}
