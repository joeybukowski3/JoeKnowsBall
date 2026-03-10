import { tournamentRegions } from "@/lib/data/tournamentRegions";
import type { TournamentFieldEntry, TournamentRegion } from "@/lib/types";
import { getCanonicalTeamIdentity } from "@/lib/utils/teamMatcher";

// Editable tournament field source of truth.
// Update team names here when the official bracket is announced.
const regionFieldNames: Record<TournamentRegion, string[]> = {
  East: [
    "Houston",
    "Wisconsin",
    "Saint Mary's",
    "Colorado State",
    "Gonzaga",
    "Mississippi State",
    "Texas Tech",
    "Florida Atlantic",
    "Seton Hall",
    "Nevada",
    "Drake",
    "McNeese",
    "Princeton",
    "Vermont",
    "South Dakota State",
    "Howard",
  ],
  West: [
    "Connecticut",
    "Creighton",
    "Baylor",
    "Kansas",
    "Clemson",
    "TCU",
    "San Diego State",
    "Boise State",
    "Utah State",
    "Dayton",
    "VCU",
    "Grand Canyon",
    "Charleston",
    "Akron",
    "Colgate",
    "Longwood",
  ],
  South: [
    "Purdue",
    "Duke",
    "Marquette",
    "Alabama",
    "Auburn",
    "BYU",
    "Illinois",
    "Texas",
    "Virginia",
    "Northwestern",
    "New Mexico",
    "Liberty",
    "Yale",
    "Samford",
    "UC Irvine",
    "Morehead State",
  ],
  Midwest: [
    "Tennessee",
    "Arizona",
    "North Carolina",
    "Iowa State",
    "Kentucky",
    "Michigan State",
    "Florida",
    "Colorado",
    "Texas A&M",
    "Washington State",
    "Indiana State",
    "James Madison",
    "Appalachian State",
    "Belmont",
    "Princeton State",
    "Montana State",
  ],
};

export const tournamentField: TournamentFieldEntry[] = tournamentRegions.flatMap((region) =>
  regionFieldNames[region].map((displayName, index) => {
    const canonical = getCanonicalTeamIdentity(displayName);

    return {
      teamId: canonical.id,
      displayName: canonical.displayName,
      seed: index + 1,
      region,
      slot: index + 1,
      playIn: false,
      active: true,
      locked: true,
    };
  }),
);

export const activeTournamentField = tournamentField.filter((entry) => entry.active !== false);
export const tournamentFieldTeamIds = activeTournamentField.map((entry) => entry.teamId);

export function getTournamentEntryByTeamId(teamId: string) {
  return activeTournamentField.find((entry) => entry.teamId === teamId) ?? null;
}
