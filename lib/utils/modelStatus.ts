import type { DataSource, Team } from "@/lib/types";
import { getStatsStatus } from "@/lib/utils/statAvailability";

export type ModelStatusSummary = {
  updatedLabel: string;
  statsCoveragePercent: number;
  dataMode: "Live Stats" | "Partial Fallback" | "Mock Fallback";
};

function formatUpdatedAt(value?: string) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(date);
}

export function buildModelStatusSummary({
  teams,
  dataSource,
  updatedAt,
}: {
  teams: Team[];
  dataSource: DataSource;
  updatedAt?: string;
}): ModelStatusSummary {
  const profiles = teams
    .map((team) => team.statProfile)
    .filter((profile): profile is NonNullable<Team["statProfile"]> => Boolean(profile));
  const totalCompleteness =
    profiles.length > 0
      ? profiles.reduce((sum, profile) => sum + profile.completeness, 0) / profiles.length
      : dataSource === "live"
        ? 0.5
        : 0;

  return {
    updatedLabel: formatUpdatedAt(updatedAt ?? profiles[0]?.updatedAt),
    statsCoveragePercent: Math.round(totalCompleteness * 100),
    dataMode: getStatsStatus(profiles),
  };
}
