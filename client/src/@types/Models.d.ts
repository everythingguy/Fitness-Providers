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
