import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../index.js";

describe("Auth APIs", () => {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email,
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user?.email).toBe(email);
  });

  it("should login user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
