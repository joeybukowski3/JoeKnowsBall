import { NextResponse } from "next/server";
import { getNcaaTeamData } from "@/lib/api/liveData";

type RouteContext = {
  params: Promise<{
    teamId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { teamId } = await context.params;
  const response = await getNcaaTeamData(teamId);

  return NextResponse.json(response);
}
