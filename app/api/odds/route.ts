import { NextResponse } from "next/server";
import { odds } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    data: odds,
    meta: {
      source: "mock",
      count: odds.length,
    },
  });
}
