import type { NormalizedTeamStats } from "@/lib/types";

const coreKeys: Array<keyof NormalizedTeamStats["values"]> = [
  "adjustedOffense",
  "adjustedDefense",
  "shooting",
  "rebounding",
  "ballControl",
  "strengthOfSchedule",
];

export function getStatCompleteness(profile: NormalizedTeamStats) {
  const availableCore = coreKeys.filter((key) => profile.values[key] !== null).length;
  return {
    coreCoverage: Number((availableCore / coreKeys.length).toFixed(2)),
    missingCore: coreKeys.filter((key) => profile.values[key] === null),
  };
}

export function getStatsStatus(profiles: NormalizedTeamStats[]) {
  if (profiles.length === 0) {
    return "Mock Fallback" as const;
  }

  const liveCount = profiles.filter((profile) => profile.status === "live").length;
  const partialCount = profiles.filter((profile) => profile.status === "partial-fallback").length;

  if (liveCount >= Math.ceil(profiles.length * 0.55)) {
    return "Live Stats" as const;
  }

  if (liveCount + partialCount > 0) {
    return "Partial Fallback" as const;
  }

  return "Mock Fallback" as const;
}

export function logStatDiagnostics(profiles: NormalizedTeamStats[]) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const incomplete = profiles
    .map((profile) => ({
      teamId: profile.teamId,
      displayName: profile.displayName,
      ...getStatCompleteness(profile),
    }))
    .filter((entry) => entry.missingCore.length > 0)
    .slice(0, 15);

  if (incomplete.length > 0) {
    console.warn("[team-stats] incomplete stat profiles", incomplete);
  }

  const categoryCoverage = Object.keys(profiles[0]?.values ?? {}).map((key) => {
    const liveCount = profiles.filter(
      (profile) => profile.values[key as keyof NormalizedTeamStats["values"]] !== null,
    ).length;

    return {
      category: key,
      coverage: Number((liveCount / Math.max(profiles.length, 1)).toFixed(2)),
    };
  });

  if (categoryCoverage.length > 0) {
    console.warn("[team-stats] category coverage", categoryCoverage);
  }
}
