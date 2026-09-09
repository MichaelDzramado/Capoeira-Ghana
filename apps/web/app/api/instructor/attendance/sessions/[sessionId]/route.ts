import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  getInstructorAttendanceRoster,
  updateInstructorAttendance,
} from "@/lib/attendance/service";
import { updateAttendanceSchema } from "@/lib/attendance/schemas";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { sessionId } = await context.params;

    const roster = await getInstructorAttendanceRoster(sessionId);

    if (!roster) {
      return NextResponse.json(
        { error: "Attendance session not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { data: roster },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load attendance.";

    if (message === "Unauthorized.") {
      return NextResponse.json(
        { error: "Instructor authentication required." },
        { status: 401 },
      );
    }

    console.error(
      "GET /api/instructor/attendance/sessions/[sessionId] failed:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to load attendance roster." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { sessionId } = await context.params;
    const body: unknown = await request.json();

    const validation = updateAttendanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const roster = await updateInstructorAttendance(
      sessionId,
      body as { attendance: { studentId: string; status: "present" | "absent" | "late" | "excused"; notes?: string }[] },
    );

    if (!roster) {
      return NextResponse.json(
        { error: "Attendance session not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Attendance saved successfully.",
        data: roster,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          fieldErrors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to save attendance.";

    if (message === "Unauthorized.") {
      return NextResponse.json(
        { error: "Instructor authentication required." },
        { status: 401 },
      );
    }

    if (
      message.includes("Attendance can only") ||
      message.includes("Attendance must include") ||
      message.includes("Duplicate students")
    ) {
      return NextResponse.json(
        { error: message },
        { status: 400 },
      );
    }

    console.error(
      "PATCH /api/instructor/attendance/sessions/[sessionId] failed:",
      error,
    );

    return NextResponse.json(
      { error: "Unable to save attendance." },
      { status: 500 },
    );
  }
}
