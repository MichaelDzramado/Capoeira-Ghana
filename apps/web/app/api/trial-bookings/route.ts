import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { submitTrialBooking } from "@/lib/trial-bookings/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await submitTrialBooking(body);

    return NextResponse.json(
      {
        data: {
          submitted: true,
          message: "Trial booking submitted successfully.",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Please check the submitted booking details.",
        },
        { status: 400 },
      );
    }

    console.error("POST /api/trial-bookings failed:", error);

    return NextResponse.json(
      { error: "Unable to submit trial booking." },
      { status: 500 },
    );
  }
}
