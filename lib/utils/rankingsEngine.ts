import type { RankingPreset, Team } from "@/lib/types";

export function rankingsEngine(teams: Team[], preset: RankingPreset) {
  return {
    teams,
    preset,
    message: "Placeholder rankings engine. Replace with weighted scoring logic.",
  };
}
