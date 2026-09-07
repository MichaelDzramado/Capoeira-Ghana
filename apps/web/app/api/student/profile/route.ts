import { NextResponse } from "next/server";

import {
  getCurrentStudentProfile,
  updateCurrentStudentProfile,
} from "@/lib/student-profile-data-access";
import { studentProfileSchema } from "@/lib/student-profile-schema";

export async function GET() {
  try {
    const profile = await getCurrentStudentProfile();

    if (!profile) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { profile },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load your student profile." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();

    const result = studentProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          fieldErrors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const profile = await updateCurrentStudentProfile(result.data);

    if (!profile) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message: "Student profile updated successfully.",
        profile,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update profile.";

    if (message === "Unauthorized.") {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Unable to update your student profile." },
      { status: 500 },
    );
  }
}
