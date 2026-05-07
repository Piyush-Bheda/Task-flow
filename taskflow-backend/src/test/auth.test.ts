import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../index.js";

describe("Auth APIs", () => {
  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "test1@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should login user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test1@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
