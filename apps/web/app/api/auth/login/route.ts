import { NextResponse } from "next/server";

import { loginStudent } from "@/lib/auth/data-access";
import { loginSchema } from "@/lib/auth/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Please correct the highlighted fields.",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { user } = await loginStudent(result.data);

    return NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to log in.";

    if (message.toLowerCase().includes("invalid login credentials")) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Unable to log in. Please try again." },
      { status: 500 },
    );
  }
}
