import { NextResponse } from "next/server";
import { getNcaaRankingsData } from "@/lib/api/liveData";

export async function GET() {
  const response = await getNcaaRankingsData();

  return NextResponse.json(response);
}
