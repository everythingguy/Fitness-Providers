import request from "supertest";
import { Connection } from "mongoose";

import app, { apiPath } from "../../server";
import { errorResponse, userResponse } from "../../@types/response";
import connectDB, { getMongoURI } from "./../../utils/db";

let authCookie = "";
let accessToken = "";
let conn: Connection;

beforeAll(async () => {
  conn = await connectDB(getMongoURI("-user-router"));
});

afterAll(async () => {
  await conn.dropDatabase();
  await conn.close();
});

describe("env", () => {
  it("should have node env", () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
  it("should have db username", () => {
    expect(process.env.DB_USERNAME).toBeDefined();
  });
  it("should have db password", () => {
    expect(process.env.DB_PASSWORD).toBeDefined();
  });
  it("should have db auth source", () => {
    expect(process.env.DB_AUTHSOURCE).toBeDefined();
  });
  it("should have db ip", () => {
    expect(process.env.DB_IP).toBeDefined();
  });
  it("should have db port", () => {
    expect(process.env.DB_PORT).toBeDefined();
  });
  it("should have db collection", () => {
    expect(process.env.DB_NAME).toBeDefined();
  });
  it("should have secret", () => {
    expect(process.env.SECRET).toBeDefined();
  });
  it("should have express port", () => {
    expect(process.env.PORT).toBeDefined();
  });
  it("should have ci boolean", () => {
    expect(process.env.CI).toBeDefined();
  });
});

describe(`GET ${apiPath}/users/login`, () => {
  it("should reject the incorrect login", (done) => {
    request(app)
      .post(`${apiPath}/users/login`)
      .send({
        username: "john",
        password: "doe21",
      })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        const resp = JSON.parse(res.text);
        expect(resp).toEqual({
          success: false,
          error: "Inncorrect Username or Password",
        });
        done();
      });
  });
});

describe(`GET ${apiPath}/users`, () => {
  it("should fail to return the user's info", (done) => {
    request(app)
      .get(`${apiPath}/users`)
      .set("Authorization", "bearer " + accessToken)
      .expect(401)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
        done();
      });
  });
});

describe(`POST ${apiPath}/users/logout`, () => {
  it("should fail to logout the user", (done) => {
    request(app)
      .post(`${apiPath}/users/logout`)
      .set("Authorization", "bearer " + accessToken)
      .expect(401)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
        done();
      });
  });
});

describe(`DELETE ${apiPath}/users`, () => {
  it("should fail to delete the user", (done) => {
    request(app)
      .del(`${apiPath}/users`)
      .set("Authorization", "bearer " + accessToken)
      .expect(401)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
        done();
      });
  });
});

describe(`GET ${apiPath}/users/register`, () => {
  it("should register a new user named john doe", (done) => {
    request(app)
      .post(`${apiPath}/users/register`)
      .send({
        name: "John Doe",
        email: "jdoe@doe.com",
        username: "john",
        password: "doe21",
      })
      .expect(201)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done({ err, resError: JSON.parse(res.text).error });
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data.user.name).toEqual("John Doe");
        expect(resp.data.user.username).toEqual("john");
        expect(resp.data.user.email).toEqual("jdoe@doe.com");
        expect(resp.data.user._id).toBeDefined();
        const dataAny = resp.data as any;
        expect(dataAny.user.password).toBeUndefined();
        done();
      });
  });
});

describe(`GET ${apiPath}/users/register`, () => {
  it("should fail to register the same username", (done) => {
    request(app)
      .post(`${apiPath}/users/register`)
      .send({
        name: "John Doe",
        email: "jdoe22@doe.com",
        username: "john",
        password: "doe21",
      })
      .expect(409)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done({ err, resError: JSON.parse(res.text).error });
        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("username already exists");
        done();
      });
  });
});

describe(`GET ${apiPath}/users/register`, () => {
  it("should fail to register the same email", (done) => {
    request(app)
      .post(`${apiPath}/users/register`)
      .send({
        name: "John Doe",
        email: "jdoe@doe.com",
        username: "john12",
        password: "doe21",
      })
      .expect(409)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done({ err, resError: JSON.parse(res.text).error });
        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("email already exists");
        done();
      });
  });
});

describe(`GET ${apiPath}/users/login`, () => {
  it("should successfully login", (done) => {
    request(app)
      .post(`${apiPath}/users/login`)
      .set("Authorization", "bearer " + accessToken)
      .send({
        username: "john",
        password: "doe21",
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data).toBeDefined();
        expect(resp.data.user.email).toBeDefined();
        expect(resp.data.user.username).toBeDefined();
        expect(resp.data.user.name).toBeDefined();
        expect(resp.data.user._id).toBeDefined();
        const dataAny = resp.data as any;
        expect(dataAny.user.password).toBeUndefined();

        // set cookie
        expect(res.headers["set-cookie"]).toBeDefined();
        const cookies = res.headers["set-cookie"][0]
          .split(",")
          .map((item: string) => item.split(";")[0]);
        authCookie = cookies.join(";");

        // set access token
        expect(resp.data.accessToken).toBeDefined();
        accessToken = resp.data.accessToken;

        done();
      });
  });
});

describe(`GET ${apiPath}/users/login`, () => {
  it("should fail to login twice", (done) => {
    request(app)
      .post(`${apiPath}/users/login`)
      .set("Authorization", "bearer " + accessToken)
      .send({
        username: "john",
        password: "doe21",
      })
      .expect(400)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please logout before logging in");
        done();
      });
  });
});

describe(`GET ${apiPath}/users`, () => {
  it("should return the user's info", (done) => {
    request(app)
      .get(`${apiPath}/users`)
      .set("Authorization", "bearer " + accessToken)
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data).toBeDefined();
        expect(resp.data.user.email).toBeDefined();
        expect(resp.data.user.username).toBeDefined();
        expect(resp.data.user.name).toBeDefined();
        expect(resp.data.user._id).toBeDefined();
        const dataAny = resp.data as any;
        expect(dataAny.user.password).toBeUndefined();
        done();
      });
  });
});

describe(`POST ${apiPath}/users/logout`, () => {
  it("should logout the user", (done) => {
    request(app)
      .post(`${apiPath}/users/logout`)
      .set("Authorization", "bearer " + accessToken)
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data.user).toBeUndefined();
        expect(resp.data.accessToken).toBe("");

        accessToken = resp.data.accessToken;

        done();
      });
  });
});

describe(`GET ${apiPath}/users`, () => {
  it("should fail to return the user's info", (done) => {
    request(app)
      .get(`${apiPath}/users`)
      .set("Authorization", "bearer " + accessToken)
      .expect(401)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
        done();
      });
  });
});

describe(`GET ${apiPath}/users/login`, () => {
  it("should successfully login", (done) => {
    request(app)
      .post(`${apiPath}/users/login`)
      .set("Authorization", "bearer " + accessToken)
      .send({
        username: "john",
        password: "doe21",
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data).toBeDefined();
        expect(resp.data.user.email).toBeDefined();
        expect(resp.data.user.username).toBeDefined();
        expect(resp.data.user.name).toBeDefined();
        expect(resp.data.user._id).toBeDefined();
        const dataAny = resp.data as any;
        expect(dataAny.user.password).toBeUndefined();

        // set refresh token cookie
        expect(res.headers["set-cookie"]).toBeDefined();
        const cookies = res.headers["set-cookie"][0]
          .split(",")
          .map((item: string) => item.split(";")[0]);
        authCookie = cookies.join(";");

        // set access token
        expect(resp.data.accessToken).toBeDefined();
        accessToken = resp.data.accessToken;

        done();
      });
  });
});

describe(`DELETE ${apiPath}/users`, () => {
  it("should delete the user", (done) => {
    request(app)
      .del(`${apiPath}/users`)
      .set("Authorization", "bearer " + accessToken)
      .set("Cookie", authCookie)
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data).toBeDefined();
        expect(resp.data.user.email).toBeDefined();
        expect(resp.data.user.username).toBeDefined();
        expect(resp.data.user.name).toBeDefined();
        expect(resp.data.user._id).toBeDefined();
        const dataAny = resp.data as any;
        expect(dataAny.user.password).toBeUndefined();
        done();
      });
  });
});

describe(`GET ${apiPath}/users`, () => {
  it("should fail to return the user's info", (done) => {
    request(app)
      .get(`${apiPath}/users`)
      .set("Authorization", "bearer " + accessToken)
      .expect(401)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
        done();
      });
  });
});
