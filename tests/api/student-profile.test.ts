import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentStudentProfile: vi.fn(),
  updateCurrentStudentProfile: vi.fn(),
}));

vi.mock("@/lib/student-profile-data-access", () => ({
  getCurrentStudentProfile: mocks.getCurrentStudentProfile,
  updateCurrentStudentProfile: mocks.updateCurrentStudentProfile,
}));

import {
  GET,
  PATCH,
} from "@/app/api/student/profile/route";

describe("GET /api/student/profile", () => {
  it("returns 401 when there is no authenticated student", async () => {
    mocks.getCurrentStudentProfile.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required.",
    });
  });

  it("returns the current student profile", async () => {
    const profile = {
      id: "student-user-id",
      email: "student@example.com",
      firstName: "Ginga",
      lastName: "Student",
      phone: "+233500000000",
      status: "active",
      studentProfile: {
        id: "student-profile-id",
        date_of_birth: "2000-01-01",
        emergency_contact_name: "Emergency Contact",
        emergency_contact_phone: "+233511111111",
        joined_at: "2026-09-07",
      },
    };

    mocks.getCurrentStudentProfile.mockResolvedValueOnce(profile);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ profile });
  });
});

describe("PATCH /api/student/profile", () => {
  it("rejects invalid profile data", async () => {
    const request = new Request(
      "http://localhost/api/student/profile",
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          firstName: "A",
          lastName: "",
          phone: "",
          dateOfBirth: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
        }),
      },
    );

    const response = await PATCH(request);

    expect(response.status).toBe(400);
    expect(mocks.updateCurrentStudentProfile).not.toHaveBeenCalled();
  });

  it("updates a valid student profile", async () => {
    const profile = {
      id: "student-user-id",
      email: "student@example.com",
      firstName: "Ginga",
      lastName: "Student",
      phone: "+233500000000",
      status: "active",
      studentProfile: {
        id: "student-profile-id",
        date_of_birth: "2000-01-01",
        emergency_contact_name: "Emergency Contact",
        emergency_contact_phone: "+233511111111",
        joined_at: "2026-09-07",
      },
    };

    mocks.updateCurrentStudentProfile.mockResolvedValueOnce(profile);

    const request = new Request(
      "http://localhost/api/student/profile",
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          firstName: "Ginga",
          lastName: "Student",
          phone: "+233500000000",
          dateOfBirth: "2000-01-01",
          emergencyContactName: "Emergency Contact",
          emergencyContactPhone: "+233511111111",
        }),
      },
    );

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "Student profile updated successfully.",
      profile,
    });
  });

  it("returns 401 when an update is unauthorized", async () => {
    mocks.updateCurrentStudentProfile.mockRejectedValueOnce(
      new Error("Unauthorized."),
    );

    const request = new Request(
      "http://localhost/api/student/profile",
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          firstName: "Ginga",
          lastName: "Student",
          phone: "",
          dateOfBirth: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
        }),
      },
    );

    const response = await PATCH(request);

    expect(response.status).toBe(401);
  });
});
