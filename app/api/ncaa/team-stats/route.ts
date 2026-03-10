import { NextResponse } from "next/server";
import { getNcaaTeamStatsData, getNcaaTeamsData } from "@/lib/api/liveData";

export async function GET() {
  const teamsResult = await getNcaaTeamsData();
  const response = await getNcaaTeamStatsData(teamsResult.data);

  return NextResponse.json(response);
}
