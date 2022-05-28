// TODO: update tests to work with confirmation email and forgot password

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

describe(`POST ${apiPath}/users/login`, () => {
    it("should reject the incorrect login", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/login`)
            .send({
                username: "john",
                password: "doe21"
            })
            .expect(401);

        const resp = JSON.parse(res.text);
        expect(resp).toEqual({
            success: false,
            error: "Inncorrect Username or Password"
        });
    });
});

describe(`GET ${apiPath}/users`, () => {
    it("should fail to return the user's info", async () => {
        const res = await request(app)
            .get(`${apiPath}/users`)
            .set("Authorization", "bearer " + accessToken)
            .expect(401)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
    });
});

describe(`POST ${apiPath}/users/logout`, () => {
    it("should fail to logout the user", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/logout`)
            .set("Authorization", "bearer " + accessToken)
            .expect(401)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
    });
});

describe(`DELETE ${apiPath}/users`, () => {
    it("should fail to delete the user", async () => {
        const res = await request(app)
            .del(`${apiPath}/users`)
            .set("Authorization", "bearer " + accessToken)
            .expect(401)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
    });
});

describe(`POST ${apiPath}/users/register`, () => {
    it("should fail to register with mismatch passwords", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/register`)
            .send({
                firstName: "John",
                lastName: "Doe",
                email: "jdoe@doe.com",
                username: "john12",
                password: "doe21",
                re_password: "doe212121"
            })
            .expect(400)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual({
            password: "password and confirm password do not match"
        });
    });

    it("should register a new user named john doe", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/register`)
            .send({
                firstName: "John",
                lastName: "Doe",
                email: "jdoe@doe.com",
                username: "john",
                password: "doe21",
                re_password: "doe21"
            })
            .expect(201)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data.user.name).toEqual("John Doe");
        expect(resp.data.user.username).toEqual("john");
        expect(resp.data.user.email).toEqual("jdoe@doe.com");
        expect(resp.data.user._id).toBeDefined();
        const dataAny = resp.data as any;
        expect(dataAny.user.password).toBeUndefined();
    });

    it("should fail to register the same username", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/register`)
            .send({
                firstName: "John",
                lastName: "Doe",
                email: "jdoe22@doe.com",
                username: "john",
                password: "doe21",
                re_password: "doe21"
            })
            .expect(409)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual({
            username: "username already exists"
        });
    });

    it("should fail to register the same email", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/register`)
            .send({
                firstName: "John",
                lastName: "Doe",
                email: "jdoe@doe.com",
                username: "john12",
                password: "doe21",
                re_password: "doe21"
            })
            .expect(409)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual({ email: "email already exists" });
    });
});

describe(`POST ${apiPath}/users/login`, () => {
    it("should successfully login", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/login`)
            .set("Authorization", "bearer " + accessToken)
            .send({
                username: "john",
                password: "doe21"
            })
            .expect(200)
            .expect("Content-Type", /json/);

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
    });

    it("should fail to login twice", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/login`)
            .set("Authorization", "bearer " + accessToken)
            .send({
                username: "john",
                password: "doe21"
            })
            .expect(400)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please logout before logging in");
    });
});

describe(`GET ${apiPath}/users`, () => {
    it("should return the user's info", async () => {
        const res = await request(app)
            .get(`${apiPath}/users`)
            .set("Authorization", "bearer " + accessToken)
            .expect(200)
            .expect("Content-Type", /json/);

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
    });
});

describe(`POST ${apiPath}/users/logout`, () => {
    it("should logout the user", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/logout`)
            .set("Authorization", "bearer " + accessToken)
            .expect(200)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data.user).toBeUndefined();
        expect(resp.data.accessToken).toBe("");

        accessToken = resp.data.accessToken;
    });
});

describe(`GET ${apiPath}/users`, () => {
    it("should fail to return the user's info", async () => {
        const res = await request(app)
            .get(`${apiPath}/users`)
            .set("Authorization", "bearer " + accessToken)
            .expect(401)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
    });
});

describe(`POST ${apiPath}/users/login`, () => {
    it("should successfully login", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/login`)
            .set("Authorization", "bearer " + accessToken)
            .send({
                username: "john",
                password: "doe21"
            })
            .expect(200)
            .expect("Content-Type", /json/);

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
    });
});

describe(`DELETE ${apiPath}/users`, () => {
    it("should delete the user", async () => {
        const res = await request(app)
            .del(`${apiPath}/users`)
            .set("Authorization", "bearer " + accessToken)
            .set("Cookie", authCookie)
            .expect(200)
            .expect("Content-Type", /json/);

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
    });
});

describe(`GET ${apiPath}/users`, () => {
    it("should fail to return the user's info", async () => {
        const res = await request(app)
            .get(`${apiPath}/users`)
            .set("Authorization", "bearer " + accessToken)
            .expect(401)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
    });
});
