import { NextResponse } from "next/server";
import { games } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    data: games.slice(0, 8),
    meta: {
      source: "mock",
      round: "First Round",
    },
  });
}
