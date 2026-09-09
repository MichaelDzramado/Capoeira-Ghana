import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listInstructorAttendanceSessions: vi.fn(),
  getInstructorAttendanceRoster: vi.fn(),
  updateInstructorAttendance: vi.fn(),
}));

vi.mock("@/lib/attendance/service", () => ({
  listInstructorAttendanceSessions:
    mocks.listInstructorAttendanceSessions,
  getInstructorAttendanceRoster:
    mocks.getInstructorAttendanceRoster,
  updateInstructorAttendance:
    mocks.updateInstructorAttendance,
}));

import { GET as GET_SESSIONS } from "@/app/api/instructor/attendance/sessions/route";
import {
  GET as GET_ROSTER,
  PATCH as PATCH_ROSTER,
} from "@/app/api/instructor/attendance/sessions/[sessionId]/route";

const sessionId = "50000000-0000-0000-0000-000000000001";
const studentId = "10000000-0000-4000-8000-000000000001";

describe("GET /api/instructor/attendance/sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when instructor authentication is missing", async () => {
    mocks.listInstructorAttendanceSessions.mockRejectedValueOnce(
      new Error("Unauthorized."),
    );

    const response = await GET_SESSIONS();

    expect(response.status).toBe(401);

    await expect(response.json()).resolves.toEqual({
      error: "Instructor authentication required.",
    });
  });

  it("returns instructor attendance sessions", async () => {
    const sessions = [
      {
        id: sessionId,
        classId: "40000000-0000-0000-0000-000000000002",
        className: "Tuesday Fundamentals",
        sessionDate: "2026-09-01",
        startTime: "18:00:00",
        endTime: "19:15:00",
      },
    ];

    mocks.listInstructorAttendanceSessions.mockResolvedValueOnce(
      sessions,
    );

    const response = await GET_SESSIONS();

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      data: sessions,
    });

    expect(
      mocks.listInstructorAttendanceSessions,
    ).toHaveBeenCalledTimes(1);
  });

  it("returns 500 for unexpected service failures", async () => {
    mocks.listInstructorAttendanceSessions.mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const response = await GET_SESSIONS();

    expect(response.status).toBe(500);

    await expect(response.json()).resolves.toEqual({
      error: "Unable to load attendance sessions.",
    });
  });
});

describe("GET /api/instructor/attendance/sessions/[sessionId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when instructor authentication is missing", async () => {
    mocks.getInstructorAttendanceRoster.mockRejectedValueOnce(
      new Error("Unauthorized."),
    );

    const response = await GET_ROSTER(
      new Request(
        `http://localhost:3000/api/instructor/attendance/sessions/${sessionId}`,
      ),
      {
        params: Promise.resolve({ sessionId }),
      },
    );

    expect(response.status).toBe(401);

    await expect(response.json()).resolves.toEqual({
      error: "Instructor authentication required.",
    });
  });

  it("returns 404 when the session is unavailable to the instructor", async () => {
    mocks.getInstructorAttendanceRoster.mockResolvedValueOnce(null);

    const response = await GET_ROSTER(
      new Request(
        `http://localhost:3000/api/instructor/attendance/sessions/${sessionId}`,
      ),
      {
        params: Promise.resolve({ sessionId }),
      },
    );

    expect(response.status).toBe(404);

    await expect(response.json()).resolves.toEqual({
      error: "Attendance session not found.",
    });
  });

  it("returns the attendance roster", async () => {
    const roster = {
      session: {
        id: sessionId,
        classId: "40000000-0000-0000-0000-000000000002",
        className: "Tuesday Fundamentals",
        sessionDate: "2026-09-01",
        startTime: "18:00:00",
        endTime: "19:15:00",
      },
      students: [
        {
          studentId,
          firstName: "Kojo",
          lastName: "Mensah",
          status: "present",
          notes: null,
        },
      ],
    };

    mocks.getInstructorAttendanceRoster.mockResolvedValueOnce(roster);

    const response = await GET_ROSTER(
      new Request(
        `http://localhost:3000/api/instructor/attendance/sessions/${sessionId}`,
      ),
      {
        params: Promise.resolve({ sessionId }),
      },
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      data: roster,
    });
  });
});

describe("PATCH /api/instructor/attendance/sessions/[sessionId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid attendance data", async () => {
    const request = new Request(
      `http://localhost:3000/api/instructor/attendance/sessions/${sessionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendance: [
            {
              studentId: "not-a-uuid",
              status: "present",
            },
          ],
        }),
      },
    );

    const response = await PATCH_ROSTER(request, {
      params: Promise.resolve({ sessionId }),
    });

    expect(response.status).toBe(400);
    expect(mocks.updateInstructorAttendance).not.toHaveBeenCalled();
  });

  it("returns 401 when instructor authentication is missing", async () => {
    mocks.updateInstructorAttendance.mockRejectedValueOnce(
      new Error("Unauthorized."),
    );

    const request = new Request(
      `http://localhost:3000/api/instructor/attendance/sessions/${sessionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendance: [
            {
              studentId,
              status: "present",
            },
          ],
        }),
      },
    );

    const response = await PATCH_ROSTER(request, {
      params: Promise.resolve({ sessionId }),
    });

    expect(response.status).toBe(401);

    await expect(response.json()).resolves.toEqual({
      error: "Instructor authentication required.",
    });
  });

  it("updates attendance for a valid roster", async () => {
    const roster = {
      session: {
        id: sessionId,
        classId: "40000000-0000-0000-0000-000000000002",
        className: "Tuesday Fundamentals",
        sessionDate: "2026-09-01",
        startTime: "18:00:00",
        endTime: "19:15:00",
      },
      students: [
        {
          studentId,
          firstName: "Kojo",
          lastName: "Mensah",
          status: "late",
          notes: "Arrived 10 minutes late",
        },
      ],
    };

    mocks.updateInstructorAttendance.mockResolvedValueOnce(roster);

    const payload = {
      attendance: [
        {
          studentId,
          status: "late",
          notes: "Arrived 10 minutes late",
        },
      ],
    };

    const request = new Request(
      `http://localhost:3000/api/instructor/attendance/sessions/${sessionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const response = await PATCH_ROSTER(request, {
      params: Promise.resolve({ sessionId }),
    });

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      message: "Attendance saved successfully.",
      data: roster,
    });

    expect(
      mocks.updateInstructorAttendance,
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.updateInstructorAttendance,
    ).toHaveBeenCalledWith(sessionId, payload);
  });

  it("returns 404 when the attendance session does not exist", async () => {
    mocks.updateInstructorAttendance.mockResolvedValueOnce(null);

    const request = new Request(
      `http://localhost:3000/api/instructor/attendance/sessions/${sessionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendance: [
            {
              studentId,
              status: "present",
            },
          ],
        }),
      },
    );

    const response = await PATCH_ROSTER(request, {
      params: Promise.resolve({ sessionId }),
    });

    expect(response.status).toBe(404);
  });
});
