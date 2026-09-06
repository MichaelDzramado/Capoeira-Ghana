import { NextResponse } from "next/server";
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
    console.error("POST /api/trial-bookings failed:", error);

    return NextResponse.json(
      {
        error: "Unable to submit trial booking.",
      },
      { status: 400 },
    );
  }
}
