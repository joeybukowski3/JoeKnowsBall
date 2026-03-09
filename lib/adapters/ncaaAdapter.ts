import { mockTeams } from "@/lib/data/mockTeams";
import type { Game, Team } from "@/lib/types";

type GenericRecord = Record<string, unknown>;

const TEAM_NAME_ALIASES: Record<string, string> = {
  uconn: "Connecticut",
  connecticuthuskies: "Connecticut",
  unc: "North Carolina",
  northcarolinatarheels: "North Carolina",
  floridaatlanticowls: "Florida Atlantic",
  floridaatlantic: "Florida Atlantic",
  iowastatecyclones: "Iowa State",
  houstoncougars: "Houston",
  dukebluedevils: "Duke",
  arizonawildcats: "Arizona",
  purdueboilermakers: "Purdue",
  tennesseevolunteers: "Tennessee",
  alabamacrimsontide: "Alabama",
  creightonbluejays: "Creighton",
  wisconsinbadgers: "Wisconsin",
};

function compactName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function normalizeTeamName(value: string) {
  const trimmed = value.trim();
  const compact = compactName(trimmed);

  return TEAM_NAME_ALIASES[compact] ?? trimmed;
}

function toSlug(value: string) {
  return normalizeTeamName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function parseRecord(record: string | undefined) {
  if (!record) {
    return { wins: 22, losses: 10 };
  }

  const match = record.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) {
    return { wins: 22, losses: 10 };
  }

  return {
    wins: Number(match[1]),
    losses: Number(match[2]),
  };
}

function findFirstString(entry: GenericRecord, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = entry;
    for (const key of path) {
      if (!current || typeof current !== "object") {
        current = undefined;
        break;
      }
      current = (current as GenericRecord)[key];
    }

    if (typeof current === "string" && current.trim()) {
      return current.trim();
    }
  }

  return undefined;
}

function findFirstNumber(entry: GenericRecord, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = entry;
    for (const key of path) {
      if (!current || typeof current !== "object") {
        current = undefined;
        break;
      }
      current = (current as GenericRecord)[key];
    }

    const parsed = parseNumber(current);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  return undefined;
}

function findArray(payload: unknown, candidates: string[][]): GenericRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((entry): entry is GenericRecord => Boolean(entry && typeof entry === "object"));
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as GenericRecord;

  for (const path of candidates) {
    let current: unknown = record;
    for (const key of path) {
      if (!current || typeof current !== "object") {
        current = undefined;
        break;
      }
      current = (current as GenericRecord)[key];
    }

    if (Array.isArray(current)) {
      return current.filter((entry): entry is GenericRecord => Boolean(entry && typeof entry === "object"));
    }
  }

  return [];
}

function buildDerivedTeam(
  name: string,
  rank: number | undefined,
  record: string | undefined,
  conference: string | undefined,
  logo: string | undefined,
  fallbackTeam?: Team,
): Team {
  const parsedRecord = parseRecord(record ?? fallbackTeam?.record);
  const winPct = parsedRecord.wins / Math.max(parsedRecord.wins + parsedRecord.losses, 1);
  const rankValue = rank ?? fallbackTeam?.rank ?? 40;
  const powerBoost = Math.max(0, 26 - rankValue);

  const offense = fallbackTeam?.metrics.offense ?? Number((108 + winPct * 18 + powerBoost * 0.35).toFixed(1));
  const defense = fallbackTeam?.metrics.defense ?? Number((101 - winPct * 10 - powerBoost * 0.22).toFixed(1));
  const shooting = fallbackTeam?.metrics.shooting ?? Number((50 + winPct * 9 + powerBoost * 0.18).toFixed(1));
  const rebounding = fallbackTeam?.metrics.rebounding ?? Number((46 + winPct * 8 + powerBoost * 0.14).toFixed(1));
  const ballControl = fallbackTeam?.metrics.ballControl ?? Number((17 - winPct * 4 - powerBoost * 0.08).toFixed(1));
  const sos = fallbackTeam?.metrics.sos ?? Math.round(68 + powerBoost * 0.9 + winPct * 12);
  const recentForm = fallbackTeam?.metrics.recentForm ?? Math.round(66 + winPct * 22 + powerBoost * 0.5);
  const homeAway = fallbackTeam?.metrics.homeAway ?? Math.round(64 + winPct * 18);
  const atsTrends = fallbackTeam?.metrics.atsTrends ?? Math.round(52 + winPct * 14 + powerBoost * 0.25);

  return {
    id: fallbackTeam?.id ?? toSlug(name),
    name,
    shortName: fallbackTeam?.shortName ?? name.split(" ").map((part) => part[0]).join("").slice(0, 4).toUpperCase(),
    conference: conference ?? fallbackTeam?.conference ?? "Division I",
    record: record ?? fallbackTeam?.record ?? `${parsedRecord.wins}-${parsedRecord.losses}`,
    rank: rankValue,
    seed: fallbackTeam?.seed,
    isTournamentTeam: fallbackTeam?.isTournamentTeam ?? rankValue <= 68,
    logo: logo ?? fallbackTeam?.logo ?? null,
    stats: {
      adjustedOffense: fallbackTeam?.stats.adjustedOffense ?? offense,
      adjustedDefense: fallbackTeam?.stats.adjustedDefense ?? defense,
      tempo: fallbackTeam?.stats.tempo ?? Number((66 + winPct * 6).toFixed(1)),
      effectiveFieldGoalPct: fallbackTeam?.stats.effectiveFieldGoalPct ?? Number((51 + winPct * 7).toFixed(1)),
      turnoverRate: fallbackTeam?.stats.turnoverRate ?? Number((ballControl + 1.2).toFixed(1)),
      reboundRate: fallbackTeam?.stats.reboundRate ?? rebounding,
      freeThrowRate: fallbackTeam?.stats.freeThrowRate ?? Number((30 + winPct * 7).toFixed(1)),
    },
    metrics: {
      offense,
      defense,
      shooting,
      rebounding,
      ballControl,
      sos,
      recentForm,
      homeAway,
      atsTrends,
    },
  };
}

function extractRankingEntries(payload: unknown) {
  return findArray(payload, [
    ["rankings"],
    ["data"],
    ["data", "rankings"],
    ["data", "teams"],
    ["teams"],
    ["rows"],
  ]);
}

function extractGameEntries(payload: unknown) {
  return findArray(payload, [
    ["games"],
    ["data"],
    ["data", "games"],
    ["scoreboard"],
    ["scoreboard", "games"],
    ["events"],
  ]);
}

function formatStartTime(dateValue: string | undefined) {
  if (!dateValue) {
    return "TBD";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(parsed);
}

export function adaptNcaaTeams({
  rankingsPayload,
  gamesPayload,
  fallbackTeams = mockTeams,
}: {
  rankingsPayload?: unknown;
  gamesPayload?: unknown;
  fallbackTeams?: Team[];
}) {
  const fallbackByName = new Map(
    fallbackTeams.map((team) => [normalizeTeamName(team.name), team]),
  );
  const rankingEntries = extractRankingEntries(rankingsPayload);
  const gameEntries = extractGameEntries(gamesPayload);
  const liveTeams = new Map<string, Team>();

  for (const entry of rankingEntries) {
    const name = normalizeTeamName(
      findFirstString(entry, [
        ["team"],
        ["school"],
        ["name"],
        ["teamName"],
      ]) ?? "",
    );

    if (!name) {
      continue;
    }

    const fallbackTeam = fallbackByName.get(name);
    const team = buildDerivedTeam(
      name,
      findFirstNumber(entry, [["rank"], ["currentRank"], ["position"]]),
      findFirstString(entry, [["record"], ["stats", "record"]]),
      findFirstString(entry, [["conference"], ["conferenceName"]]),
      findFirstString(entry, [["logo"], ["logos", "0", "href"]]),
      fallbackTeam,
    );
    liveTeams.set(name, team);
  }

  for (const entry of gameEntries) {
    const names = [
      normalizeTeamName(
        findFirstString(entry, [
          ["away", "name"],
          ["away", "team"],
          ["away_team"],
          ["competitions", "0", "competitors", "1", "team", "displayName"],
        ]) ?? "",
      ),
      normalizeTeamName(
        findFirstString(entry, [
          ["home", "name"],
          ["home", "team"],
          ["home_team"],
          ["competitions", "0", "competitors", "0", "team", "displayName"],
        ]) ?? "",
      ),
    ].filter(Boolean);

    for (const name of names) {
      if (!liveTeams.has(name)) {
        const fallbackTeam = fallbackByName.get(name);
        liveTeams.set(
          name,
          buildDerivedTeam(name, fallbackTeam?.rank, fallbackTeam?.record, fallbackTeam?.conference, fallbackTeam?.logo ?? undefined, fallbackTeam),
        );
      }
    }
  }

  const resolvedTeams = Array.from(liveTeams.values());
  if (resolvedTeams.length < 8) {
    return fallbackTeams;
  }

  return resolvedTeams.sort((left, right) => left.rank - right.rank);
}

export function adaptNcaaGames(payload: unknown, teams: Team[], fallbackGames: Game[]) {
  const entries = extractGameEntries(payload);
  if (entries.length === 0) {
    return fallbackGames;
  }

  const normalizedTeams = new Map(teams.map((team) => [normalizeTeamName(team.name), team]));
  const adaptedGames = entries
    .map<Game | null>((entry, index) => {
      const homeTeamName = normalizeTeamName(
        findFirstString(entry, [
          ["home", "name"],
          ["home", "team"],
          ["home_team"],
          ["competitions", "0", "competitors", "0", "team", "displayName"],
        ]) ?? "",
      );
      const awayTeamName = normalizeTeamName(
        findFirstString(entry, [
          ["away", "name"],
          ["away", "team"],
          ["away_team"],
          ["competitions", "0", "competitors", "1", "team", "displayName"],
        ]) ?? "",
      );

      if (!homeTeamName || !awayTeamName) {
        return null;
      }

      const homeTeam = normalizedTeams.get(homeTeamName);
      const awayTeam = normalizedTeams.get(awayTeamName);

      return {
        id:
          findFirstString(entry, [["id"], ["game", "id"], ["contestId"]]) ??
          `live-game-${index + 1}`,
        homeTeam: homeTeam?.name ?? homeTeamName,
        awayTeam: awayTeam?.name ?? awayTeamName,
        homeSeed: homeTeam?.seed,
        awaySeed: awayTeam?.seed,
        startTime: formatStartTime(
          findFirstString(entry, [["startTime"], ["gameDate"], ["date"], ["start_date"]]),
        ),
        round:
          findFirstString(entry, [["round"], ["gameState"], ["status"], ["seasonType"]]) ??
          "Regular Season",
        spread: 0,
        moneylineHome: -110,
        moneylineAway: -110,
        neutralSite: Boolean(
          entry.neutralSite ??
            entry.neutral_site ??
            findFirstString(entry, [["venue", "neutralSite"]]) === "true",
        ),
      } satisfies Game;
    })
    .filter((game): game is Game => Boolean(game));

  return adaptedGames.length > 0 ? adaptedGames : fallbackGames;
}
