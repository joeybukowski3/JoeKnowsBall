import { NextResponse } from "next/server";
import { games, teams } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    data: {
      featuredGame: games[0],
      teams: teams.slice(0, 2),
    },
    meta: {
      source: "mock",
    },
  });
}
