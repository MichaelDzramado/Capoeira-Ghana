import { NextResponse } from "next/server";

import { getAdminDashboard } from "@/lib/admin/service";

export async function GET() {
  try {
    const dashboard = await getAdminDashboard();

    return NextResponse.json(
      { data: dashboard },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load admin dashboard.";

    if (message === "Unauthorized.") {
      return NextResponse.json(
        {
          error: "Admin authentication required.",
        },
        { status: 401 },
      );
    }

    console.error(
      "GET /api/admin/dashboard failed:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to load admin dashboard.",
      },
      { status: 500 },
    );
  }
}
