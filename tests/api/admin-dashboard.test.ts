import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminDashboard: vi.fn(),
}));

vi.mock("@/lib/admin/service", () => ({
  getAdminDashboard: mocks.getAdminDashboard,
}));

import { GET } from "@/app/api/admin/dashboard/route";

describe("GET /api/admin/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when admin authentication is missing", async () => {
    mocks.getAdminDashboard.mockRejectedValueOnce(
      new Error("Unauthorized."),
    );

    const response = await GET();

    expect(response.status).toBe(401);

    await expect(response.json()).resolves.toEqual({
      error: "Admin authentication required.",
    });
  });

  it("returns the admin dashboard", async () => {
    const dashboard = {
      kpis: {
        activeStudents: 12,
        activeEnrollments: 14,
        pendingTrials: 3,
        attendanceRate: 78,
      },
      upcomingClasses: [
        {
          id: "20000000-0000-4000-8000-000000000001",
          session_date: "2026-09-29",
          start_time: "15:30:00",
          end_time: "17:30:00",
          classes: {
            id: "30000000-0000-4000-8000-000000000001",
            name: "Capoeira Fundamentals",
            locations: {
              name: "Adidome Community Centre",
              city: "Adidome",
            },
          },
        },
      ],
      recentTrials: [
        {
          id: "40000000-0000-4000-8000-000000000001",
          student_name: "Ama Mensah",
          email: "ama@example.com",
          preferred_date: "2026-09-30",
          status: "pending",
          booked_at: "2026-09-28T09:00:00+00:00",
          programs: {
            name: "Capoeira Fundamentals",
          },
          classes: {
            name: "Capoeira Fundamentals",
          },
        },
      ],
      recentBeltAwards: [
        {
          id: "50000000-0000-4000-8000-000000000001",
          student_id: "60000000-0000-4000-8000-000000000001",
          awarded_at: "2026-09-28",
          notes: "Progression assessment completed.",
          belts: {
            name: "Amarela",
            rank_order: 3,
          },
          student_profiles: {
            users: {
              first_name: "Kojo",
              last_name: "Mensah",
            },
          },
        },
      ],
    };

    mocks.getAdminDashboard.mockResolvedValueOnce(
      dashboard,
    );

    const response = await GET();

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      data: dashboard,
    });

    expect(
      mocks.getAdminDashboard,
    ).toHaveBeenCalledTimes(1);
  });

  it("returns 500 for unexpected service failures", async () => {
    mocks.getAdminDashboard.mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const response = await GET();

    expect(response.status).toBe(500);

    await expect(response.json()).resolves.toEqual({
      error: "Unable to load admin dashboard.",
    });
  });
});
