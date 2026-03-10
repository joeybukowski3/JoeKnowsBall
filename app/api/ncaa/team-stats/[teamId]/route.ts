import { NextResponse } from "next/server";
import { getNcaaTeamStatsData, getNcaaTeamsData } from "@/lib/api/liveData";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const teamsResult = await getNcaaTeamsData();
  const statsResult = await getNcaaTeamStatsData(teamsResult.data);
  const teamStats = statsResult.data.find((entry) => entry.teamId === teamId) ?? null;

  return NextResponse.json({
    data: teamStats,
    meta: statsResult.meta,
  });
}
