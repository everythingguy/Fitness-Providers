// TODO: update tests to work with confirmation email and forgot password
// TODO: write tests for /api/v1/users/:id and /api/v1/users (GET ALL)

import request from "supertest";
import faker from "faker";
import { Connection, Model } from "mongoose";

import app, { apiPath } from "../../server";
import { errorResponse, userResponse } from "../../@types/response";
import connectDB, { getMongoURI } from "./../../utils/db";

let authCookie = "";
let accessToken = "";
let conn: Connection;

function createFakeUser() {
    return {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName()
    };
}

beforeAll(async () => {
    conn = await connectDB(getMongoURI("-user-router"));

    const promises: Promise<void>[] = [];
    for (const modelStr of conn.modelNames()) {
        const model: Model<unknown> = conn.model(modelStr);
        promises.push(model.ensureIndexes());
    }
    await Promise.all(promises);
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

describe(`GET ${apiPath}/users/me`, () => {
    it("should fail to return the user's info", async () => {
        const res = await request(app)
            .get(`${apiPath}/users/me`)
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

describe(`DELETE ${apiPath}/users/me`, () => {
    it("should fail to delete the user", async () => {
        const res = await request(app)
            .del(`${apiPath}/users/me`)
            .set("Authorization", "bearer " + accessToken)
            .expect(401)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
    });
});

const user = createFakeUser();

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

    it("should register a new user", async () => {
        const res = await request(app)
            .post(`${apiPath}/users/register`)
            .send({
                ...user,
                re_password: user.password
            })
            .expect(201)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data.user.name).toEqual(
            `${user.firstName} ${user.lastName}`
        );
        expect(resp.data.user.username).toEqual(user.username);
        expect(resp.data.user.email).toEqual(user.email);
        expect(resp.data.user._id).toBeDefined();
        const dataAny = resp.data as any;
        expect(dataAny.user.password).toBeUndefined();
    });

    it("should fail to register the same username", async () => {
        const u = createFakeUser();

        const res = await request(app)
            .post(`${apiPath}/users/register`)
            .send({
                ...u,
                username: user.username,
                re_password: u.password
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
        const u = createFakeUser();

        const res = await request(app)
            .post(`${apiPath}/users/register`)
            .send({
                ...u,
                email: user.email,
                re_password: u.password
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
                username: user.username,
                password: user.password
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
                username: user.username,
                password: user.password
            })
            .expect(400)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please logout before logging in");
    });
});

describe(`GET ${apiPath}/users/me`, () => {
    it("should return the user's info", async () => {
        const res = await request(app)
            .get(`${apiPath}/users/me`)
            .set("Authorization", "bearer " + accessToken)
            .expect(200)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as userResponse).toBeDefined();
        const resp = JSON.parse(res.text) as userResponse;
        expect(resp.success).toBeTruthy();
        expect(resp.data).toBeDefined();
        expect(resp.data.user.email).toEqual(user.email);
        expect(resp.data.user.username).toEqual(user.username);
        expect(resp.data.user.name).toEqual(
            `${user.firstName} ${user.lastName}`
        );
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

describe(`GET ${apiPath}/users/me`, () => {
    it("should fail to return the user's info", async () => {
        const res = await request(app)
            .get(`${apiPath}/users/me`)
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
                username: user.username,
                password: user.password
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

describe(`DELETE ${apiPath}/users/me`, () => {
    it("should delete the user", async () => {
        const res = await request(app)
            .del(`${apiPath}/users/me`)
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

describe(`GET ${apiPath}/users/me`, () => {
    it("should fail to return the user's info", async () => {
        const res = await request(app)
            .get(`${apiPath}/users/me`)
            .set("Authorization", "bearer " + accessToken)
            .expect(401)
            .expect("Content-Type", /json/);

        expect(JSON.parse(res.text) as errorResponse).toBeDefined();
        const resp = JSON.parse(res.text) as errorResponse;
        expect(resp.success).toBeFalsy();
        expect(resp.error).toEqual("Please signin to gain access");
    });
});
