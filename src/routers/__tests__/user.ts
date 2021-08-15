import request from "supertest";
import { Connection } from "mongoose";

import app, { apiPath } from "../../server";
import { errorResponse, userResponse } from "../../types/response";
import connectDB, { getMongoURI } from "./../../utils/db";

var authCookie = "";
var conn: Connection;

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

describe(`GET ${apiPath}/user/login`, () => {
  it("should reject the incorrect login", (done) => {
    request(app)
      .post(`${apiPath}/user/login`)
      .send({
        username: "john",
        password: "doe21",
      })
      .expect(401)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).toEqual("Unauthorized");
        done();
      });
  });
});

describe(`GET ${apiPath}/user`, () => {
  it("should fail to return the user's info", (done) => {
    request(app)
      .get(`${apiPath}/user`)
      .set("Cookie", authCookie)
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

describe(`POST ${apiPath}/user/logout`, () => {
  it("should fail to logout the user", (done) => {
    request(app)
      .post(`${apiPath}/user/logout`)
      .set("Cookie", authCookie)
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

describe(`DELETE ${apiPath}/user`, () => {
  it("should fail to delete the user", (done) => {
    request(app)
      .del(`${apiPath}/user`)
      .set("Cookie", authCookie)
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

describe(`GET ${apiPath}/user/register`, () => {
  it("should register a new user named john doe", (done) => {
    request(app)
      .post(`${apiPath}/user/register`)
      .set("Cookie", authCookie)
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
        expect(resp.data.name).toEqual("John Doe");
        expect(resp.data.username).toEqual("john");
        expect(resp.data.email).toEqual("jdoe@doe.com");
        expect(resp.data._id).toBeDefined();
        expect(resp.data.password).toBeUndefined();
        done();
      });
  });
});

describe(`GET ${apiPath}/user/register`, () => {
  it("should fail to register the same username", (done) => {
    request(app)
      .post(`${apiPath}/user/register`)
      .set("Cookie", authCookie)
      .send({
        name: "John Doe",
        email: "jdoe@doe.com",
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
        expect(resp.error).toEqual("Username already in use");
        done();
      });
  });
});

describe(`GET ${apiPath}/user/register`, () => {
  it("should fail to register the same email", (done) => {
    request(app)
      .post(`${apiPath}/user/register`)
      .set("Cookie", authCookie)
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
        expect(resp.error).toEqual("Email already in use");
        done();
      });
  });
});

describe(`GET ${apiPath}/user/login`, () => {
  it("should successfully login", (done) => {
    request(app)
      .post(`${apiPath}/user/login`)
      .set("Cookie", authCookie)
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
        expect(resp.data.email).toBeDefined();
        expect(resp.data.username).toBeDefined();
        expect(resp.data.name).toBeDefined();
        expect(resp.data._id).toBeDefined();
        expect(resp.data.password).toBeUndefined();

        //set cookie
        expect(res.headers["set-cookie"]).toBeDefined();
        const cookies = res.headers["set-cookie"][0]
          .split(",")
          .map((item: string) => item.split(";")[0]);
        authCookie = cookies.join(";");

        done();
      });
  });
});

describe(`GET ${apiPath}/user/login`, () => {
  it("should fail to login twice", (done) => {
    request(app)
      .post(`${apiPath}/user/login`)
      .set("Cookie", authCookie)
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
        expect(res.headers["set-cookie"]).toBeUndefined();
        done();
      });
  });
});

describe(`GET ${apiPath}/user`, () => {
  it("should return the user's info", (done) => {
    request(app)
      .get(`${apiPath}/user`)
      .set("Cookie", authCookie)
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data).toBeDefined();
        expect(resp.data.email).toBeDefined();
        expect(resp.data.username).toBeDefined();
        expect(resp.data.name).toBeDefined();
        expect(resp.data._id).toBeDefined();
        expect(resp.data.password).toBeUndefined();
        done();
      });
  });
});

describe(`POST ${apiPath}/user/logout`, () => {
  it("should logout the user", (done) => {
    request(app)
      .post(`${apiPath}/user/logout`)
      .set("Cookie", authCookie)
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data).toBeUndefined();
        done();
      });
  });
});

describe(`GET ${apiPath}/user`, () => {
  it("should fail to return the user's info", (done) => {
    request(app)
      .get(`${apiPath}/user`)
      .set("Cookie", authCookie)
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

describe(`GET ${apiPath}/user/login`, () => {
  it("should successfully login", (done) => {
    request(app)
      .post(`${apiPath}/user/login`)
      .set("Cookie", authCookie)
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
        expect(resp.data.email).toBeDefined();
        expect(resp.data.username).toBeDefined();
        expect(resp.data.name).toBeDefined();
        expect(resp.data._id).toBeDefined();
        expect(resp.data.password).toBeUndefined();

        //set cookie
        expect(res.headers["set-cookie"]).toBeDefined();
        const cookies = res.headers["set-cookie"][0]
          .split(",")
          .map((item: string) => item.split(";")[0]);
        authCookie = cookies.join(";");

        done();
      });
  });
});

describe(`DELETE ${apiPath}/user`, () => {
  it("should delete the user", (done) => {
    request(app)
      .del(`${apiPath}/user`)
      .set("Cookie", authCookie)
      .expect(200)
      .expect("Content-Type", /json/)
      .end((err, res) => {
        if (err) return done(err);
        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data).toBeDefined();
        expect(resp.data.email).toBeDefined();
        expect(resp.data.username).toBeDefined();
        expect(resp.data.name).toBeDefined();
        expect(resp.data._id).toBeDefined();
        expect(resp.data.password).toBeUndefined();
        done();
      });
  });
});

describe(`GET ${apiPath}/user`, () => {
  it("should fail to return the user's info", (done) => {
    request(app)
      .get(`${apiPath}/user`)
      .set("Cookie", authCookie)
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
