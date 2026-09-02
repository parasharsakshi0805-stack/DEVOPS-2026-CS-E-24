process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns 201", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.username).toBe("testuser");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects registration with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "onlyusername",
    });

    expect(res.statusCode).toBe(400);
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send({
      username: "userone",
      email: "dupe@example.com",
      password: "Password123!",
    });

    const res = await request(app).post("/api/auth/register").send({
      username: "usertwo",
      email: "dupe@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      username: "loginuser",
      email: "login@example.com",
      password: "Password123!",
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "WrongPassword!",
    });

    expect(res.statusCode).toBe(400);
  });

  it("rejects login for unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/auth/get-me", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/auth/get-me");
    expect(res.statusCode).toBe(401);
  });

  it("returns the logged-in user's details with a valid token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      username: "meuser",
      email: "me@example.com",
      password: "Password123!",
    });

    const cookie = registerRes.headers["set-cookie"];

    const res = await request(app).get("/api/auth/get-me").set("Cookie", cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.username).toBe("meuser");
  });
});

describe("GET /api/auth/logout", () => {
  it("clears the cookie and blacklists the token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      username: "logoutuser",
      email: "logout@example.com",
      password: "Password123!",
    });

    const cookie = registerRes.headers["set-cookie"];

    const logoutRes = await request(app).get("/api/auth/logout").set("Cookie", cookie);
    expect(logoutRes.statusCode).toBe(200);

    // Token should now be blacklisted, so /get-me should reject it
    const getMeRes = await request(app).get("/api/auth/get-me").set("Cookie", cookie);
    expect(getMeRes.statusCode).toBe(401);
  });
});