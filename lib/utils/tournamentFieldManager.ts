import { tournamentRegions } from "@/lib/data/tournamentRegions";
import { tournamentSeeds } from "@/lib/data/tournamentSeeds";
import type {
  Team,
  TournamentFieldEntry,
  TournamentFieldValidation,
  TournamentRegion,
} from "@/lib/types";

export function validateTournamentField(field: TournamentFieldEntry[]): TournamentFieldValidation {
  const warnings: string[] = [];
  const duplicateTeamIds: string[] = [];
  const duplicateSlots: string[] = [];
  const invalidRegions: string[] = [];
  const missingSeedsByRegion = Object.fromEntries(
    tournamentRegions.map((region) => [region, [] as number[]]),
  ) as Record<TournamentRegion, number[]>;

  const activeEntries = field.filter((entry) => entry.active !== false);
  const seenTeamIds = new Set<string>();
  const seenRegionSlots = new Set<string>();

  for (const entry of activeEntries) {
    if (seenTeamIds.has(entry.teamId)) {
      duplicateTeamIds.push(entry.teamId);
    }
    seenTeamIds.add(entry.teamId);

    if (!tournamentRegions.includes(entry.region)) {
      invalidRegions.push(entry.region);
    }

    const slotKey = `${entry.region}-${entry.slot}`;
    if (seenRegionSlots.has(slotKey)) {
      duplicateSlots.push(slotKey);
    }
    seenRegionSlots.add(slotKey);
  }

  for (const region of tournamentRegions) {
    const regionEntries = activeEntries.filter((entry) => entry.region === region);
    const seedsInRegion = new Set(regionEntries.map((entry) => entry.seed));

    for (const seed of tournamentSeeds) {
      if (!seedsInRegion.has(seed)) {
        missingSeedsByRegion[region].push(seed);
      }
    }
  }

  if (activeEntries.length !== 64) {
    warnings.push(`Active tournament field has ${activeEntries.length} teams instead of 64.`);
  }
  if (duplicateTeamIds.length > 0) {
    warnings.push(`Duplicate team ids found: ${duplicateTeamIds.join(", ")}.`);
  }
  if (duplicateSlots.length > 0) {
    warnings.push(`Duplicate region slots found: ${duplicateSlots.join(", ")}.`);
  }
  if (invalidRegions.length > 0) {
    warnings.push(`Invalid regions found: ${invalidRegions.join(", ")}.`);
  }

  for (const region of tournamentRegions) {
    if (missingSeedsByRegion[region].length > 0) {
      warnings.push(
        `${region} is missing seeds ${missingSeedsByRegion[region].join(", ")}.`,
      );
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    duplicateTeamIds,
    duplicateSlots,
    invalidRegions,
    missingSeedsByRegion,
  };
}

export function buildTournamentSummary(field: TournamentFieldEntry[], teams: Team[]) {
  const activeEntries = field.filter((entry) => entry.active !== false);
  const regionLeaders = tournamentRegions.map((region) =>
    activeEntries.find((entry) => entry.region === region && entry.seed === 1),
  );

  const regionAverages = tournamentRegions.map((region) => {
    const regionEntries = activeEntries.filter((entry) => entry.region === region);
    const regionTeams = regionEntries
      .map((entry) => teams.find((team) => team.id === entry.teamId))
      .filter((team): team is Team => Boolean(team));
    const averageModelScore =
      regionTeams.length > 0
        ? regionTeams.reduce((sum, team) => sum + team.metrics.offense - team.metrics.defense, 0) /
          regionTeams.length
        : 0;

    return {
      region,
      averageModelScore,
    };
  });

  const strongestRegion = [...regionAverages].sort(
    (left, right) => right.averageModelScore - left.averageModelScore,
  )[0];
  const weakestRegion = [...regionAverages].sort(
    (left, right) => left.averageModelScore - right.averageModelScore,
  )[0];

  return {
    teamCount: activeEntries.length,
    regionLeaders,
    strongestRegion,
    weakestRegion,
  };
}

export function logTournamentFieldWarnings(validation: TournamentFieldValidation) {
  if (process.env.NODE_ENV === "production" || validation.warnings.length === 0) {
    return;
  }

  for (const warning of validation.warnings) {
    console.warn(`[tournamentField] ${warning}`);
  }
}
