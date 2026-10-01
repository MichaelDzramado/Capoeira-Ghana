import { NextResponse } from "next/server";
import { getPublicContent } from "@/lib/content/service";

export async function GET() {
  try {
    const content = await getPublicContent();

    return NextResponse.json({
      data: content,
    });
  } catch (error) {
    console.error("Content API error:", error);

    return NextResponse.json(
      {
        error: "Unable to load public content",
      },
      { status: 500 },
    );
  }
}
