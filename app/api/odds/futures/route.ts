import { NextResponse } from "next/server";
import { getFuturesData } from "@/lib/api/liveData";

export async function GET() {
  const response = await getFuturesData();

  return NextResponse.json(response);
}
