import { NextResponse } from "next/server";

import { registerSchema } from "@/lib/auth/schema";
import { registerStudent } from "@/lib/auth/data-access";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          fieldErrors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const registration = await registerStudent(result.data);

    return NextResponse.json(
      {
        message: "Registration successful.",
        user: {
          id: registration.user.id,
          email: registration.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed.";

    const isConflict =
      message.toLowerCase().includes("already registered") ||
      message.toLowerCase().includes("already exists");

    return NextResponse.json(
      {
        error: message,
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}
