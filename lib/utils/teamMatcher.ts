import { canonicalTeamById, ncaaTeamAliases } from "@/lib/data/teamAliases";
import type { Team, TeamMatchResult } from "@/lib/types";
import { createTeamSlug, normalizeTeamName } from "@/lib/utils/teamNameNormalizer";

const aliasIndex = new Map<string, { id: string; displayName: string; confidence: TeamMatchResult["confidence"] }>();
const unresolvedNames = new Set<string>();

for (const team of ncaaTeamAliases) {
  aliasIndex.set(normalizeTeamName(team.displayName), {
    id: team.id,
    displayName: team.displayName,
    confidence: "exact",
  });

  for (const alias of team.aliases) {
    aliasIndex.set(normalizeTeamName(alias), {
      id: team.id,
      displayName: team.displayName,
      confidence: alias === team.displayName ? "exact" : "alias",
    });
  }
}

function logUnresolved(rawName: string, context?: string) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const key = normalizeTeamName(rawName);
  if (unresolvedNames.has(key)) {
    return;
  }

  unresolvedNames.add(key);
  console.warn(`[teamMatcher] unresolved team name${context ? ` in ${context}` : ""}: ${rawName}`);
}

export function getCanonicalTeamIdentity(rawName: string) {
  const normalized = normalizeTeamName(rawName);
  const aliased = aliasIndex.get(normalized);

  if (aliased) {
    return {
      id: aliased.id,
      displayName: aliased.displayName,
      confidence: aliased.confidence,
    };
  }

  const derivedName = rawName.trim();

  return {
    id: createTeamSlug(derivedName),
    displayName: derivedName,
    confidence: "derived" as const,
  };
}

export function matchTeamName(
  rawName: string,
  teams: Team[],
  context?: string,
): TeamMatchResult {
  const identity = getCanonicalTeamIdentity(rawName);
  const normalizedRaw = normalizeTeamName(rawName);
  const matchedTeam =
    teams.find((team) => team.id === identity.id) ??
    teams.find((team) => getCanonicalTeamIdentity(team.name).id === identity.id) ??
    teams.find((team) => normalizeTeamName(team.name) === normalizedRaw) ??
    teams.find((team) => normalizeTeamName(team.shortName) === normalizedRaw) ??
    null;

  if (!matchedTeam && identity.confidence === "derived") {
    logUnresolved(rawName, context);
  }

  return {
    sourceName: rawName,
    canonicalId: identity.id,
    canonicalName: canonicalTeamById[identity.id]?.displayName ?? identity.displayName,
    confidence: matchedTeam ? identity.confidence : "unresolved",
    matchedTeam,
  };
}

export function namesReferToSameTeam(left: string, right: string) {
  return getCanonicalTeamIdentity(left).id === getCanonicalTeamIdentity(right).id;
}

export function getTournamentTeamIdsFromTeams(teams: Team[]) {
  return teams.filter((team) => team.isTournamentTeam).map((team) => team.id);
}

export function getUnresolvedTeamDiagnostics() {
  return Array.from(unresolvedNames.values());
}
