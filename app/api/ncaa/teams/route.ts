import { NextResponse } from "next/server";
import { getNcaaTeamsData } from "@/lib/api/liveData";

export async function GET() {
  const response = await getNcaaTeamsData();

  return NextResponse.json(response);
}
