interface Base {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface Provider extends Base {
  user: Types.ObjectId;
  address: Address;
  isEnrolled: boolean;
  phone: string;
  bio?: string;
  website?: string;
  tags: Types.ObjectId[];
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
