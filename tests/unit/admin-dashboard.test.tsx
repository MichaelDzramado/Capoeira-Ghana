/* @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import {
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminDashboard } from "@/components/admin/admin-dashboard";

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
      booked_at: "2026-09-28T09:00:00.000Z",
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
      student_id:
        "60000000-0000-4000-8000-000000000001",
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

function createFetchMock() {
  return vi.fn(async () => {
    return new Response(
      JSON.stringify({
        data: dashboard,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  });
}

describe("AdminDashboard", () => {
  let fetchMock: ReturnType<typeof createFetchMock>;

  beforeEach(() => {
    fetchMock = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and displays dashboard KPIs", async () => {
    render(<AdminDashboard />);

    expect(
      await screen.findByText("Active Students"),
    ).toBeInTheDocument();

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("78%")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/dashboard",
    );
  });

  it("displays upcoming classes", async () => {
    render(<AdminDashboard />);

    const upcomingClassesSection =
      await screen.findByRole("region", {
        name: "Upcoming Classes",
      });

    expect(
      upcomingClassesSection,
    ).toHaveTextContent("Capoeira Fundamentals");

    expect(
      upcomingClassesSection,
    ).toHaveTextContent(
      "Adidome Community Centre, Adidome",
    );
  });

  it("displays recent trial bookings", async () => {
    render(<AdminDashboard />);

    expect(
      await screen.findByRole("heading", {
        name: "Recent Trial Bookings",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ama Mensah"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("ama@example.com"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("pending"),
    ).toBeInTheDocument();
  });

  it("displays recent belt awards", async () => {
    render(<AdminDashboard />);

    expect(
      await screen.findByRole("heading", {
        name: "Recent Belt Awards",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Kojo Mensah"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Amarela/),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Progression assessment completed.",
      ),
    ).toBeInTheDocument();
  });

  it("displays an API error when the dashboard cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error:
              "Unable to load admin dashboard.",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    render(<AdminDashboard />);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Unable to load admin dashboard.",
    );
  });
});
