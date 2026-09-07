import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/lib/auth/schema";

describe("registration API contract", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      firstName: "Michael",
      lastName: "Dzramado",
      email: "student@example.com",
      password: "GingaTest123!",
      phone: "+233501234567",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid registration payloads", () => {
    const result = registerSchema.safeParse({
      firstName: "A",
      lastName: "",
      email: "not-an-email",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("allows an omitted phone number", () => {
    const result = registerSchema.safeParse({
      firstName: "Student",
      lastName: "Test",
      email: "student@example.com",
      password: "GingaTest123!",
    });

    expect(result.success).toBe(true);
  });
});

describe("login API contract", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "student@example.com",
      password: "GingaTest123!",
    });

    expect(result.success).toBe(true);
  });
});
