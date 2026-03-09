import { NextResponse } from "next/server";
import { getNcaabOddsData } from "@/lib/api/liveData";

export async function GET() {
  const response = await getNcaabOddsData();

  return NextResponse.json(response);
}
