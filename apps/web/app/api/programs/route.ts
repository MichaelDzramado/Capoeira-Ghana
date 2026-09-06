import { NextResponse } from "next/server";
import { listPrograms } from "@/lib/programs/service";

export async function GET() {
  try {
    const programs = await listPrograms();

    return NextResponse.json({
      data: programs,
    });
  } catch (error) {
    console.error("GET /api/programs failed:", error);

    return NextResponse.json(
      {
        error: "Unable to load programs.",
      },
      { status: 500 },
    );
  }
}
