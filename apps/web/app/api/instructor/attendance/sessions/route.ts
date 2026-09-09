import { NextResponse } from "next/server";

import { listInstructorAttendanceSessions } from "@/lib/attendance/service";

export async function GET() {
  try {
    const sessions = await listInstructorAttendanceSessions();

    return NextResponse.json(
      { data: sessions },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load sessions.";

    if (message === "Unauthorized.") {
      return NextResponse.json(
        { error: "Instructor authentication required." },
        { status: 401 },
      );
    }

    console.error("GET /api/instructor/attendance/sessions failed:", error);

    return NextResponse.json(
      { error: "Unable to load attendance sessions." },
      { status: 500 },
    );
  }
}
