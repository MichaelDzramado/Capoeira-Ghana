import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listInstructorProgressionStudents: vi.fn(),
  getInstructorStudentProgression: vi.fn(),
  updateInstructorStudentProgression: vi.fn(),
}));

vi.mock("@/lib/progression/service", () => ({
  listInstructorProgressionStudents:
    mocks.listInstructorProgressionStudents,
  getInstructorStudentProgression:
    mocks.getInstructorStudentProgression,
  updateInstructorStudentProgression:
    mocks.updateInstructorStudentProgression,
}));

import { GET as GET_STUDENTS } from "@/app/api/instructor/progression/students/route";
import {
  GET as GET_STUDENT,
  PATCH as PATCH_STUDENT,
} from "@/app/api/instructor/progression/students/[studentId]/route";

const studentId =
  "10000000-0000-4000-8000-000000000002";

const beltId =
  "5862828e-17b9-496f-ac25-c9e531cff29e";

describe("GET /api/instructor/progression/students", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when instructor authentication is missing", async () => {
    mocks.listInstructorProgressionStudents.mockRejectedValueOnce(
      new Error("Unauthorized."),
    );

    const response = await GET_STUDENTS();

    expect(response.status).toBe(401);

    await expect(response.json()).resolves.toEqual({
      error: "Instructor authentication required.",
    });
  });

  it("returns instructor students", async () => {
    const students = [
      {
        studentId,
        firstName: "Adwoa",
        lastName: "Owusu",
      },
    ];

    mocks.listInstructorProgressionStudents.mockResolvedValueOnce(
      students,
    );

    const response = await GET_STUDENTS();

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      data: students,
    });

    expect(
      mocks.listInstructorProgressionStudents,
    ).toHaveBeenCalledTimes(1);
  });

  it("returns 500 for unexpected service failures", async () => {
    mocks.listInstructorProgressionStudents.mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const response = await GET_STUDENTS();

    expect(response.status).toBe(500);

    await expect(response.json()).resolves.toEqual({
      error: "Unable to load progression students.",
    });
  });
});

describe(
  "GET /api/instructor/progression/students/[studentId]",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 401 when instructor authentication is missing", async () => {
      mocks.getInstructorStudentProgression.mockRejectedValueOnce(
        new Error("Unauthorized."),
      );

      const response = await GET_STUDENT(
        new Request(
          `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        ),
        {
          params: Promise.resolve({ studentId }),
        },
      );

      expect(response.status).toBe(401);

      await expect(response.json()).resolves.toEqual({
        error: "Instructor authentication required.",
      });
    });

    it("returns 404 when the student is unavailable to the instructor", async () => {
      mocks.getInstructorStudentProgression.mockResolvedValueOnce(
        null,
      );

      const response = await GET_STUDENT(
        new Request(
          `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        ),
        {
          params: Promise.resolve({ studentId }),
        },
      );

      expect(response.status).toBe(404);

      await expect(response.json()).resolves.toEqual({
        error:
          "Student not found or not assigned to this instructor.",
      });
    });

    it("returns student progression", async () => {
      const progression = {
        student: {
          studentId,
          firstName: "Adwoa",
          lastName: "Owusu",
        },
        progress: {
          id: "65e5d7c8-e731-4c01-820d-4379aca8cdd1",
          studentId,
          currentBeltId: beltId,
          currentBeltName: "Amarela",
          currentBeltRank: 3,
          currentBeltDescription:
            "Developing practitioner level.",
          notes: "Progression verification test",
          updatedAt: "2026-09-21T12:50:06.92279+00:00",
        },
        belts: [
          {
            id: beltId,
            name: "Amarela",
            rankOrder: 3,
            description: "Developing practitioner level.",
          },
        ],
        history: [],
      };

      mocks.getInstructorStudentProgression.mockResolvedValueOnce(
        progression,
      );

      const response = await GET_STUDENT(
        new Request(
          `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        ),
        {
          params: Promise.resolve({ studentId }),
        },
      );

      expect(response.status).toBe(200);

      await expect(response.json()).resolves.toEqual({
        data: progression,
      });
    });
  },
);

describe(
  "PATCH /api/instructor/progression/students/[studentId]",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns 400 for invalid progression data", async () => {
      const request = new Request(
        `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            beltId: "not-a-uuid",
          }),
        },
      );

      const response = await PATCH_STUDENT(request, {
        params: Promise.resolve({ studentId }),
      });

      expect(response.status).toBe(400);
      expect(
        mocks.updateInstructorStudentProgression,
      ).not.toHaveBeenCalled();
    });

    it("returns 401 when instructor authentication is missing", async () => {
      mocks.updateInstructorStudentProgression.mockRejectedValueOnce(
        new Error("Unauthorized."),
      );

      const request = new Request(
        `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            beltId,
          }),
        },
      );

      const response = await PATCH_STUDENT(request, {
        params: Promise.resolve({ studentId }),
      });

      expect(response.status).toBe(401);

      await expect(response.json()).resolves.toEqual({
        error: "Instructor authentication required.",
      });
    });

    it("updates student progression", async () => {
      const progression = {
        student: {
          studentId,
          firstName: "Adwoa",
          lastName: "Owusu",
        },
        progress: {
          id: "65e5d7c8-e731-4c01-820d-4379aca8cdd1",
          studentId,
          currentBeltId: beltId,
          currentBeltName: "Amarela",
          currentBeltRank: 3,
          currentBeltDescription:
            "Developing practitioner level.",
          notes: "Awarded after progression assessment.",
          updatedAt: "2026-09-21T12:50:06.92279+00:00",
        },
        belts: [],
        history: [],
      };

      const payload = {
        beltId,
        notes: "Awarded after progression assessment.",
      };

      mocks.updateInstructorStudentProgression.mockResolvedValueOnce(
        progression,
      );

      const request = new Request(
        `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const response = await PATCH_STUDENT(request, {
        params: Promise.resolve({ studentId }),
      });

      expect(response.status).toBe(200);

      await expect(response.json()).resolves.toEqual({
        data: progression,
      });

      expect(
        mocks.updateInstructorStudentProgression,
      ).toHaveBeenCalledTimes(1);

      expect(
        mocks.updateInstructorStudentProgression,
      ).toHaveBeenCalledWith(studentId, payload);
    });

    it("returns 409 when the student already has the selected belt", async () => {
      mocks.updateInstructorStudentProgression.mockRejectedValueOnce(
        new Error("Student already has this belt."),
      );

      const request = new Request(
        `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            beltId,
          }),
        },
      );

      const response = await PATCH_STUDENT(request, {
        params: Promise.resolve({ studentId }),
      });

      expect(response.status).toBe(409);

      await expect(response.json()).resolves.toEqual({
        error: "Student already has this belt.",
      });
    });

    it("returns 403 when the instructor is not authorized for the student", async () => {
      mocks.updateInstructorStudentProgression.mockRejectedValueOnce(
        new Error(
          "Instructor is not authorized for this student.",
        ),
      );

      const request = new Request(
        `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            beltId,
          }),
        },
      );

      const response = await PATCH_STUDENT(request, {
        params: Promise.resolve({ studentId }),
      });

      expect(response.status).toBe(403);

      await expect(response.json()).resolves.toEqual({
        error:
          "You are not authorized to update this student.",
      });
    });

    it("returns 404 when the student is unavailable to the instructor", async () => {
      mocks.updateInstructorStudentProgression.mockResolvedValueOnce(
        null,
      );

      const request = new Request(
        `http://localhost:3000/api/instructor/progression/students/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            beltId,
          }),
        },
      );

      const response = await PATCH_STUDENT(request, {
        params: Promise.resolve({ studentId }),
      });

      expect(response.status).toBe(404);

      await expect(response.json()).resolves.toEqual({
        error:
          "Student not found or not assigned to this instructor.",
      });
    });
  },
);
