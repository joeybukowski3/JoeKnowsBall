import { NextResponse } from "next/server";
import { getNcaaTeamsData, getNcaaGamesData } from "@/lib/api/liveData";

export async function GET() {
  const teams = await getNcaaTeamsData();
  const games = await getNcaaGamesData(teams.data);

  return NextResponse.json(games);
}
