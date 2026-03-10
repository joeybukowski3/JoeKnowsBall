import { canonicalTeamById } from "@/lib/data/teamAliases";
import type { GameOddsLine, Team } from "@/lib/types";
import { getCanonicalTeamIdentity, getUnresolvedTeamDiagnostics } from "@/lib/utils/teamMatcher";

export type TeamCoverageRow = {
  canonicalId: string;
  displayName: string;
  hasLiveLogo: boolean;
  hasLiveStats: boolean;
  hasOddsMapping: boolean;
  inTournamentField: boolean;
  unresolvedAliasIssue: boolean;
  fallbackStatus: "live" | "partial-fallback" | "mock-fallback" | "unknown";
};

const loggedCoverageKeys = new Set<string>();

export function buildTeamCoverageReport({
  teams,
  oddsLines = [],
  tournamentTeamIds = [],
}: {
  teams: Team[];
  oddsLines?: GameOddsLine[];
  tournamentTeamIds?: string[];
}) {
  const oddsTeamIds = new Set(
    oddsLines.flatMap((line) => [
      getCanonicalTeamIdentity(line.homeTeam).id,
      getCanonicalTeamIdentity(line.awayTeam).id,
    ]),
  );
  const tournamentSet = new Set(tournamentTeamIds);

  const rows: TeamCoverageRow[] = teams.map((team) => ({
    canonicalId: team.id,
    displayName: team.name,
    hasLiveLogo: Boolean(team.logoUrl || team.logo),
    hasLiveStats: Boolean(team.statProfile?.isLive),
    hasOddsMapping: oddsTeamIds.has(team.id),
    inTournamentField: tournamentSet.has(team.id) || team.isTournamentTeam,
    unresolvedAliasIssue: !canonicalTeamById[team.id],
    fallbackStatus: team.statProfile?.status ?? "unknown",
  }));

  return {
    rows,
    unresolvedAliasNames: getUnresolvedTeamDiagnostics(),
    summary: {
      totalTeams: rows.length,
      liveLogoTeams: rows.filter((row) => row.hasLiveLogo).length,
      liveStatsTeams: rows.filter((row) => row.hasLiveStats).length,
      oddsMappedTeams: rows.filter((row) => row.hasOddsMapping).length,
      unresolvedAliasTeams: rows.filter((row) => row.unresolvedAliasIssue).length,
      fallbackTeams: rows.filter((row) => row.fallbackStatus !== "live").length,
    },
  };
}

export function logTeamCoverageReport(
  label: string,
  report: ReturnType<typeof buildTeamCoverageReport>,
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const key = `${label}:${JSON.stringify(report.summary)}:${report.unresolvedAliasNames.join("|")}`;
  if (loggedCoverageKeys.has(key)) {
    return;
  }

  loggedCoverageKeys.add(key);

  const flagged = report.rows
    .filter(
      (row) =>
        !row.hasLiveLogo ||
        !row.hasLiveStats ||
        row.unresolvedAliasIssue ||
        (row.inTournamentField && !row.hasOddsMapping),
    )
    .slice(0, 20)
    .map((row) => ({
      canonicalId: row.canonicalId,
      displayName: row.displayName,
      hasLiveLogo: row.hasLiveLogo,
      hasLiveStats: row.hasLiveStats,
      hasOddsMapping: row.hasOddsMapping,
      inTournamentField: row.inTournamentField,
      unresolvedAliasIssue: row.unresolvedAliasIssue,
      fallbackStatus: row.fallbackStatus,
    }));

  console.warn(`[team-coverage] ${label}`, {
    summary: report.summary,
    unresolvedAliasNames: report.unresolvedAliasNames.slice(0, 20),
    flagged,
  });
}
