import { NextResponse } from "next/server";

import {
  listInstructorProgressionStudents,
} from "@/lib/progression/service";

export async function GET() {
  try {
    const students =
      await listInstructorProgressionStudents();

    return NextResponse.json(
      { data: students },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load instructor students.";

    if (message === "Unauthorized.") {
      return NextResponse.json(
        {
          error:
            "Instructor authentication required.",
        },
        { status: 401 },
      );
    }

    console.error(
      "GET /api/instructor/progression/students failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load progression students.",
      },
      { status: 500 },
    );
  }
}
