import { mockTeams } from "@/lib/data/mockTeams";
import { tournamentFieldTeamIds } from "@/lib/data/tournamentField";
import type { Game, Team } from "@/lib/types";
import { createTeamSlug } from "@/lib/utils/teamNameNormalizer";
import { getCanonicalTeamIdentity, matchTeamName } from "@/lib/utils/teamMatcher";

type GenericRecord = Record<string, unknown>;
const missingLogoTeams = new Set<string>();

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

function findFirstObject(entry: GenericRecord, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = entry;
    for (const key of path) {
      if (!current || typeof current !== "object") {
        current = undefined;
        break;
      }
      current = (current as GenericRecord)[key];
    }

    if (current && typeof current === "object" && !Array.isArray(current)) {
      return current as GenericRecord;
    }
  }

  return undefined;
}

function findFirstArray(entry: GenericRecord, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = entry;
    for (const key of path) {
      if (!current || typeof current !== "object") {
        current = undefined;
        break;
      }
      current = (current as GenericRecord)[key];
    }

    if (Array.isArray(current)) {
      return current.filter(
        (value): value is GenericRecord => Boolean(value && typeof value === "object"),
      );
    }
  }

  return [];
}

function normalizeLogoSet(entry: GenericRecord, fallbackTeam?: Team) {
  const directLogo =
    findFirstString(entry, [
      ["logo"],
      ["logoUrl"],
      ["image"],
      ["images", "default"],
      ["brand", "logo"],
    ]) ??
    fallbackTeam?.logoUrl ??
    fallbackTeam?.logo ??
    null;

  const logoObject =
    findFirstObject(entry, [
      ["logos", "0"],
      ["team", "logos", "0"],
      ["teamInfo", "logo"],
      ["brand", "logos", "0"],
    ]) ?? null;

  const logoEntries = [
    ...findFirstArray(entry, [["logos"], ["team", "logos"], ["brand", "logos"]]),
  ];

  const lightLogo =
    findFirstString(entry, [
      ["logoLightUrl"],
      ["lightLogo"],
      ["images", "light"],
    ]) ??
    findFirstString(
      logoObject ?? {},
      [["light"], ["href"], ["url"]],
    ) ??
    logoEntries.find((logo) =>
      String(logo.rel ?? "")
        .toLowerCase()
        .includes("light"),
    )?.href?.toString() ??
    fallbackTeam?.logoLightUrl ??
    directLogo;

  const darkLogo =
    findFirstString(entry, [
      ["logoDarkUrl"],
      ["darkLogo"],
      ["images", "dark"],
    ]) ??
    logoEntries.find((logo) =>
      String(logo.rel ?? "")
        .toLowerCase()
        .includes("dark"),
    )?.href?.toString() ??
    fallbackTeam?.logoDarkUrl ??
    directLogo;

  const primaryLogo =
    directLogo ??
    findFirstString(
      logoObject ?? {},
      [["href"], ["url"], ["default"]],
    ) ??
    logoEntries.map((logo) => findFirstString(logo, [["href"], ["url"]])).find(Boolean) ??
    null;

  return {
    logoUrl: primaryLogo,
    logoLightUrl: lightLogo ?? primaryLogo,
    logoDarkUrl: darkLogo ?? primaryLogo,
    hasLiveLogo: Boolean(primaryLogo),
  };
}

function logMissingLogo(team: Team) {
  if (process.env.NODE_ENV === "production" || team.hasLiveLogo) {
    return;
  }

  if (missingLogoTeams.has(team.id)) {
    return;
  }

  missingLogoTeams.add(team.id);
  console.warn(`[teamLogos] missing live logo for ${team.name}`);
}

function findArray(payload: unknown, candidates: string[][]): GenericRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (entry): entry is GenericRecord => Boolean(entry && typeof entry === "object"),
    );
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
      return current.filter(
        (entry): entry is GenericRecord => Boolean(entry && typeof entry === "object"),
      );
    }
  }

  return [];
}

function buildDerivedTeam(
  rawName: string,
  rank: number | undefined,
  record: string | undefined,
  conference: string | undefined,
  logoEntry: GenericRecord | undefined,
  fallbackTeam?: Team,
): Team {
  const identity = getCanonicalTeamIdentity(rawName);
  const parsedRecord = parseRecord(record ?? fallbackTeam?.record);
  const winPct = parsedRecord.wins / Math.max(parsedRecord.wins + parsedRecord.losses, 1);
  const rankValue = rank ?? fallbackTeam?.rank ?? 40;
  const powerBoost = Math.max(0, 26 - rankValue);

  const offense =
    fallbackTeam?.metrics.offense ??
    Number((108 + winPct * 18 + powerBoost * 0.35).toFixed(1));
  const defense =
    fallbackTeam?.metrics.defense ??
    Number((101 - winPct * 10 - powerBoost * 0.22).toFixed(1));
  const shooting =
    fallbackTeam?.metrics.shooting ??
    Number((50 + winPct * 9 + powerBoost * 0.18).toFixed(1));
  const rebounding =
    fallbackTeam?.metrics.rebounding ??
    Number((46 + winPct * 8 + powerBoost * 0.14).toFixed(1));
  const ballControl =
    fallbackTeam?.metrics.ballControl ??
    Number((17 - winPct * 4 - powerBoost * 0.08).toFixed(1));
  const sos = fallbackTeam?.metrics.sos ?? Math.round(68 + powerBoost * 0.9 + winPct * 12);
  const recentForm =
    fallbackTeam?.metrics.recentForm ?? Math.round(66 + winPct * 22 + powerBoost * 0.5);
  const homeAway = fallbackTeam?.metrics.homeAway ?? Math.round(64 + winPct * 18);
  const atsTrends =
    fallbackTeam?.metrics.atsTrends ?? Math.round(52 + winPct * 14 + powerBoost * 0.25);
  const logos = normalizeLogoSet(logoEntry ?? {}, fallbackTeam);

  return {
    id: fallbackTeam?.id ?? identity.id ?? createTeamSlug(rawName),
    name: fallbackTeam?.name ?? identity.displayName,
    shortName:
      fallbackTeam?.shortName ??
      identity.displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 4)
        .toUpperCase(),
    conference: conference ?? fallbackTeam?.conference ?? "Division I",
    record: record ?? fallbackTeam?.record ?? `${parsedRecord.wins}-${parsedRecord.losses}`,
    rank: rankValue,
    seed: fallbackTeam?.seed,
    isTournamentTeam:
      fallbackTeam?.isTournamentTeam ?? tournamentFieldTeamIds.includes(identity.id),
    logo: logos.logoUrl,
    logoUrl: logos.logoUrl,
    logoDarkUrl: logos.logoDarkUrl,
    logoLightUrl: logos.logoLightUrl,
    hasLiveLogo: logos.hasLiveLogo,
    stats: {
      adjustedOffense: fallbackTeam?.stats.adjustedOffense ?? offense,
      adjustedDefense: fallbackTeam?.stats.adjustedDefense ?? defense,
      tempo: fallbackTeam?.stats.tempo ?? Number((66 + winPct * 6).toFixed(1)),
      effectiveFieldGoalPct:
        fallbackTeam?.stats.effectiveFieldGoalPct ?? Number((51 + winPct * 7).toFixed(1)),
      turnoverRate:
        fallbackTeam?.stats.turnoverRate ?? Number((ballControl + 1.2).toFixed(1)),
      reboundRate: fallbackTeam?.stats.reboundRate ?? rebounding,
      freeThrowRate:
        fallbackTeam?.stats.freeThrowRate ?? Number((30 + winPct * 7).toFixed(1)),
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
  const entries = findArray(payload, [
    ["games"],
    ["data"],
    ["data", "games"],
    ["scoreboard"],
    ["scoreboard", "games"],
    ["events"],
  ]);

  return entries.map((entry) =>
    entry.game && typeof entry.game === "object" ? (entry.game as GenericRecord) : entry,
  );
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
  const fallbackById = new Map(
    fallbackTeams.map((team) => [getCanonicalTeamIdentity(team.name).id, team]),
  );
  const rankingEntries = extractRankingEntries(rankingsPayload);
  const gameEntries = extractGameEntries(gamesPayload);
  const liveTeams = new Map<string, Team>();

  for (const entry of rankingEntries) {
    const rawName =
      findFirstString(entry, [
        ["team"],
        ["school"],
        ["name"],
        ["teamName"],
        ["School"],
        ["SCHOOL (1ST PLACE VOTES)"],
      ])?.replace(/\s+\(\d+\)$/g, "") ?? "";

    if (!rawName) {
      continue;
    }

    const match = matchTeamName(rawName, fallbackTeams, "ncaa-rankings");
    const fallbackTeam = match.matchedTeam ?? fallbackById.get(match.canonicalId);
    const logoEntry = {
      ...entry,
      logo: findFirstString(entry, [["logo"], ["logos", "0", "href"], ["logos", "0", "url"]]),
      logoLightUrl: findFirstString(entry, [["logos", "0", "light"], ["images", "light"]]),
      logoDarkUrl: findFirstString(entry, [["logos", "0", "dark"], ["images", "dark"]]),
    };
    const team = buildDerivedTeam(
      rawName,
      findFirstNumber(entry, [["rank"], ["currentRank"], ["position"], ["RANK"]]),
      findFirstString(entry, [["record"], ["stats", "record"], ["RECORD"]]),
      findFirstString(entry, [["conference"], ["conferenceName"], ["conference"]]),
      logoEntry,
      fallbackTeam ?? undefined,
    );
    logMissingLogo(team);
    liveTeams.set(team.id, team);
  }

  for (const entry of gameEntries) {
    const rawNames = [
      findFirstString(entry, [
        ["away", "name"],
        ["away", "team"],
        ["away_team"],
        ["competitions", "0", "competitors", "1", "team", "displayName"],
      ]) ?? "",
      findFirstString(entry, [
        ["home", "name"],
        ["home", "team"],
        ["home_team"],
        ["competitions", "0", "competitors", "0", "team", "displayName"],
      ]) ?? "",
    ].filter(Boolean);

    for (const rawName of rawNames) {
      const match = matchTeamName(rawName, fallbackTeams, "ncaa-games");
      const fallbackTeam = match.matchedTeam ?? fallbackById.get(match.canonicalId);

      if (!liveTeams.has(match.canonicalId)) {
        liveTeams.set(
          match.canonicalId,
          buildDerivedTeam(
            rawName,
            fallbackTeam?.rank,
            fallbackTeam?.record,
            fallbackTeam?.conference,
            {
              logo: findFirstString(entry, [
                ["logo"],
                ["team", "logo"],
                ["home", "logo"],
                ["away", "logo"],
                ["competitions", "0", "competitors", "0", "team", "logos", "0", "href"],
                ["competitions", "0", "competitors", "1", "team", "logos", "0", "href"],
              ]),
            },
            fallbackTeam ?? undefined,
          ),
        );
        const createdTeam = liveTeams.get(match.canonicalId);
        if (createdTeam) {
          logMissingLogo(createdTeam);
        }
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

  const adaptedGames = entries
    .map<Game | null>((entry, index) => {
      const rawHomeTeam =
        findFirstString(entry, [
          ["home", "name"],
          ["home", "team"],
          ["home_team"],
          ["competitions", "0", "competitors", "0", "team", "displayName"],
        ]) ?? "";
      const rawAwayTeam =
        findFirstString(entry, [
          ["away", "name"],
          ["away", "team"],
          ["away_team"],
          ["competitions", "0", "competitors", "1", "team", "displayName"],
        ]) ?? "";

      if (!rawHomeTeam || !rawAwayTeam) {
        return null;
      }

      const homeMatch = matchTeamName(rawHomeTeam, teams, "ncaa-games");
      const awayMatch = matchTeamName(rawAwayTeam, teams, "ncaa-games");

      return {
        id:
          findFirstString(entry, [["id"], ["game", "id"], ["contestId"], ["gameID"]]) ??
          `live-game-${index + 1}`,
        homeTeam: homeMatch.matchedTeam?.name ?? homeMatch.canonicalName,
        awayTeam: awayMatch.matchedTeam?.name ?? awayMatch.canonicalName,
        homeSeed: homeMatch.matchedTeam?.seed,
        awaySeed: awayMatch.matchedTeam?.seed,
        startTime: formatStartTime(
          findFirstString(entry, [
            ["startTime"],
            ["gameDate"],
            ["date"],
            ["start_date"],
            ["startDate"],
          ]),
        ),
        round:
          findFirstString(entry, [
            ["round"],
            ["gameState"],
            ["status"],
            ["seasonType"],
            ["bracketRound"],
          ]) ??
          "Regular Season",
        spread: 0,
        moneylineHome: -110,
        moneylineAway: -110,
        neutralSite: Boolean(
          entry.neutralSite ??
            entry.neutral_site ??
            (typeof entry.bracketRegion === "string" && entry.bracketRegion.trim()) ??
            (findFirstString(entry, [["venue", "neutralSite"]]) === "true"),
        ),
      };
    })
    .filter((game): game is Game => Boolean(game));

  return adaptedGames.length > 0 ? adaptedGames : fallbackGames;
}
