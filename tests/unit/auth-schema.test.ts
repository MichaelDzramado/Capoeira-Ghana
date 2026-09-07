import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/auth/schema";

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      firstName: "Michael",
      lastName: "Dzramado",
      email: "student@example.com",
      password: "strongpassword",
      phone: "0240000000",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      firstName: "Michael",
      lastName: "Dzramado",
      email: "invalid-email",
      password: "strongpassword",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      firstName: "Michael",
      lastName: "Dzramado",
      email: "student@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "student@example.com",
      password: "strongpassword",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({
      email: "student@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
