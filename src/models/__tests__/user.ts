import faker from "faker";
import { Connection } from "mongoose";

import User from "../user";
import { User as UserType } from "./../../@types/models";
import connectDB, { getMongoURI } from "./../../utils/db";

var conn: Connection;
var users: UserType[] = [];

function createFakeUser() {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.name.findName(),
    username: faker.internet.userName(),
  };
}

beforeAll(async () => {
  conn = await connectDB(getMongoURI("-user-model"));
});

afterAll(async () => {
  await conn.dropDatabase();
  await conn.close();
});

describe("Save some new users", () => {
  it("should save five fake users to the database", async () => {
    for (var i = 0; i < 5; i++) {
      const fakeUser = createFakeUser();

      const user = new User(fakeUser);
      await user.save();

      users.push(user);

      const dbUser: UserType = await User.findById(user._id);

      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(fakeUser.email);
      expect(dbUser.name).toBe(fakeUser.name);
      expect(dbUser.username).toBe(fakeUser.username);
      expect(dbUser.password).not.toBe(fakeUser.password);
    }
  });
});

describe("Update a user's username", () => {
  it("should successfully update a user's username", async () => {
    var user: UserType = await User.findById(users[0]._id);
    expect(user).toBeDefined();
    expect(user.username).toBe(users[0].username);

    users[0].username = faker.internet.userName();
    user.username = users[0].username;
    await user.save();

    user = await User.findById(users[0]._id);
    expect(user.username).toBe(users[0].username);
  });
});

describe("Error Checking", () => {
  it("should not save a invalid email", async () => {
    var fakeUser = createFakeUser();
    fakeUser.email = "test@.c";

    var user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/Invalid email address/);

    fakeUser.email = "test123";
    user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/Invalid email address/);

    fakeUser.email = "test.com";
    user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/Invalid email address/);

    fakeUser.email = "test@123";
    user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/Invalid email address/);
  });

  it("should not create two users with the same email", async () => {
    var fakeUser = createFakeUser();
    fakeUser.email = users[0].email;

    const user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/E11000/);
  });

  it("should not create two users with the same username", async () => {
    var fakeUser = createFakeUser();
    fakeUser.username = users[0].username;

    const user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/E11000/);
  });

  it("should not create a user without a name", async () => {
    var fakeUser = createFakeUser();
    fakeUser.name = "";

    const user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/Missing name/);
  });

  it("should not create a user without a email", async () => {
    var fakeUser = createFakeUser();
    fakeUser.email = "";

    const user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/Missing email/);
  });

  it("should not create a user without a username", async () => {
    var fakeUser = createFakeUser();
    fakeUser.username = "";

    const user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/Missing username/);
  });

  it("should not create a user without a password", async () => {
    var fakeUser = createFakeUser();
    fakeUser.password = "";

    const user = new User(fakeUser);
    await expect(user.save()).rejects.toThrowError(/Missing password/);
  });
});

describe("Password Comparing", () => {
  it("should return true for compare", async () => {
    const user: UserType = await User.findById(users[0]._id);
    const compare = await user.isValidPassword(users[0].password);
    expect(compare).toBeTruthy;
  });

  it("should return false for compare", async () => {
    const user: UserType = await User.findById(users[0]._id);
    const compare = await user.isValidPassword(faker.internet.password());
    expect(compare).toBeFalsy;
  });

  it("should rehash the password if it is changed", async () => {
    const user: UserType = await User.findById(users[0]._id);
    const hash = user.password;

    users[0].password = faker.internet.password();
    user.password = users[0].password;
    await user.save();

    const dbUser = await User.findById(users[0]._id);
    expect(dbUser.password).not.toBe(users[0].password);
    expect(dbUser.password).not.toBe(hash);
  });
});

describe("toJSON", () => {
  it("should return valid json", async () => {
    const user = users[3];
    const dbUser: UserType = await User.findById(user._id);

    expect(dbUser.toJSON()).toEqual({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    });
  });
});

describe("Delete all fake users", () => {
  it("should delete all the fake users from the database", async () => {
    for (const user of users) {
      await User.deleteOne({ _id: user._id });
      const dbUser: UserType = await User.findById(user._id);

      expect(dbUser).toBeNull();
    }
  });
});
