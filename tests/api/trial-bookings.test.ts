import { beforeEach, describe, expect, it, vi } from "vitest";

const { submitTrialBookingMock } = vi.hoisted(() => ({
  submitTrialBookingMock: vi.fn(),
}));

vi.mock("@/lib/trial-bookings/service", () => ({
  submitTrialBooking: submitTrialBookingMock,
}));

import { POST } from "@/app/api/trial-bookings/route";

describe("POST /api/trial-bookings", () => {
  beforeEach(() => {
    submitTrialBookingMock.mockReset();
  });

  it("returns 201 for a valid booking", async () => {
    submitTrialBookingMock.mockResolvedValue({
      submitted: true,
    });

    const request = new Request(
      "http://localhost:3000/api/trial-bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: "Michael Dzramado",
          email: "michael@example.com",
          age: 25,
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.submitted).toBe(true);
    expect(body.data.message).toBe(
      "Trial booking submitted successfully.",
    );

    expect(submitTrialBookingMock).toHaveBeenCalledTimes(1);
  });

  it("returns 400 for invalid booking data", async () => {
    const { ZodError } = await import("zod");

    submitTrialBookingMock.mockRejectedValue(
      new ZodError([
        {
          code: "custom",
          path: ["email"],
          message: "Invalid email",
        },
      ]),
    );

    const request = new Request(
      "http://localhost:3000/api/trial-bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: "",
          email: "invalid-email",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe(
      "Please check the submitted booking details.",
    );
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request(
      "http://localhost:3000/api/trial-bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{invalid json",
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid request body.");
    expect(submitTrialBookingMock).not.toHaveBeenCalled();
  });

  it("returns 500 for unexpected service failures", async () => {
    submitTrialBookingMock.mockRejectedValue(
      new Error("Database connection failed"),
    );

    const request = new Request(
      "http://localhost:3000/api/trial-bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: "Michael Dzramado",
          email: "michael@example.com",
          age: 25,
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Unable to submit trial booking.");
  });
});
