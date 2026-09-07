import { describe, expect, it } from "vitest";
import { createTrialBookingSchema } from "@/lib/trial-bookings/schemas";

describe("createTrialBookingSchema", () => {
  it("accepts a valid trial booking", () => {
    const result = createTrialBookingSchema.safeParse({
      studentName: "Michael Dzramado",
      email: "michael@example.com",
      phone: "0240000000",
      age: 25,
      programId: "550e8400-e29b-41d4-a716-446655440000",
      classId: "40000000-0000-0000-0000-000000000001",
      preferredDate: "2026-09-25",
      message: "I would like to attend a trial class.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty student name", () => {
    const result = createTrialBookingSchema.safeParse({
      studentName: "",
      email: "michael@example.com",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = createTrialBookingSchema.safeParse({
      studentName: "Michael Dzramado",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a negative age", () => {
    const result = createTrialBookingSchema.safeParse({
      studentName: "Michael Dzramado",
      email: "michael@example.com",
      age: -1,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid program ID", () => {
    const result = createTrialBookingSchema.safeParse({
      studentName: "Michael Dzramado",
      email: "michael@example.com",
      programId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an excessively long message", () => {
    const result = createTrialBookingSchema.safeParse({
      studentName: "Michael Dzramado",
      email: "michael@example.com",
      message: "a".repeat(1001),
    });

    expect(result.success).toBe(false);
  });
});
