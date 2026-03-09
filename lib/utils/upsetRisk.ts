import type { BracketMatchup } from "@/lib/types";

export function upsetRisk(matchup: BracketMatchup) {
  return {
    matchup,
    message: "Placeholder upset risk calculator.",
  };
}
