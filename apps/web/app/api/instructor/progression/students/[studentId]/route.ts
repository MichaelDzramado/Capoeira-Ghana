import { NextResponse } from "next/server";

import {
  getInstructorStudentProgression,
  updateInstructorStudentProgression,
} from "@/lib/progression/service";
import { updateStudentProgressSchema } from "@/lib/progression/schemas";

type RouteContext = {
  params: Promise<{
    studentId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { studentId } = await context.params;

    const progression =
      await getInstructorStudentProgression(
        studentId,
      );

    if (!progression) {
      return NextResponse.json(
        {
          error:
            "Student not found or not assigned to this instructor.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { data: progression },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load student progression.";

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
      "GET /api/instructor/progression/students/[studentId] failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load student progression.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { studentId } = await context.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    const validation =
      updateStudentProgressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid progression data.",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const progression =
      await updateInstructorStudentProgression(
        studentId,
        validation.data,
      );

    if (!progression) {
      return NextResponse.json(
        {
          error:
            "Student not found or not assigned to this instructor.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { data: progression },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update student progression.";

    if (message === "Unauthorized.") {
      return NextResponse.json(
        {
          error:
            "Instructor authentication required.",
        },
        { status: 401 },
      );
    }

    if (
      message ===
      "Student already has this belt."
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        { status: 409 },
      );
    }

    if (
      message ===
      "Selected belt does not exist."
    ) {
      return NextResponse.json(
        {
          error: message,
        },
        { status: 400 },
      );
    }

    if (
      message ===
      "Instructor is not authorized for this student."
    ) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to update this student.",
        },
        { status: 403 },
      );
    }

    console.error(
      "PATCH /api/instructor/progression/students/[studentId] failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update student progression.",
      },
      { status: 500 },
    );
  }
}
