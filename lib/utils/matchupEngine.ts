import type { Team } from "@/lib/types";

export function matchupEngine(teamA: Team, teamB: Team) {
  return {
    teamA,
    teamB,
    message: "Placeholder matchup engine. Add possession-based simulation here.",
  };
}
