import { NextResponse } from "next/server";
import { listClasses } from "@/lib/classes/service";

export async function GET() {
  try {
    const classes = await listClasses();

    return NextResponse.json({
      data: classes,
    });
  } catch (error) {
    console.error("GET /api/classes failed:", error);

    return NextResponse.json(
      {
        error: "Unable to load classes.",
      },
      { status: 500 },
    );
  }
}
