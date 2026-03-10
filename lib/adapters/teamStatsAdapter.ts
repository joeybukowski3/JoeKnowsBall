import type {
  NormalizedTeamStats,
  Team,
  TeamStatSource,
} from "@/lib/types";
import { canonicalTeamById } from "@/lib/data/teamAliases";
import { normalizeTeamName } from "@/lib/utils/teamNameNormalizer";
import { getCanonicalTeamIdentity, matchTeamName } from "@/lib/utils/teamMatcher";

type StatValueKey = keyof NormalizedTeamStats["values"];

type ProviderStatRecord = {
  teamId: string;
  displayName: string;
  source: TeamStatSource;
  sourceFields: string[];
  values: Partial<NormalizedTeamStats["values"]>;
};

type EspnPageConfig = {
  sourceFields: string[];
  map: (record: ParsedEspnRow) => Partial<NormalizedTeamStats["values"]>;
};

type ParsedEspnRow = {
  rank: number;
  teamName: string;
  numericCells: number[];
  labelCells: string[];
};

type GenericRecord = Record<string, unknown>;
const unresolvedBrandingNames = new Set<string>();

const espnPageConfig: Record<string, EspnPageConfig> = {
  offense: {
    sourceFields: ["espn.avgPoints", "espn.fieldGoalPct", "espn.threePointFieldGoalPct"],
    map: ({ numericCells }) => ({
      adjustedOffense: pickValue(numericCells, [0, 1]),
      shooting: pickPercentValue(numericCells, [2, 1]),
      threePointPct: pickPercentValue(numericCells, [4, 3]),
      trueShootingPct: deriveTrueShooting(numericCells),
    }),
  },
  defense: {
    sourceFields: ["espn.opponentAvgPoints", "espn.opponentFieldGoalPct", "espn.opponentThreePointFieldGoalPct"],
    map: ({ numericCells }) => ({
      adjustedDefense: pickValue(numericCells, [0, 1]),
      opponentThreePointPct: pickPercentValue(numericCells, [4, 3, 2]),
    }),
  },
  shooting: {
    sourceFields: ["espn.fieldGoalPct", "espn.threePointFieldGoalPct"],
    map: ({ numericCells }) => ({
      shooting: pickPercentValue(numericCells, [0, 1]),
      threePointPct: pickPercentValue(numericCells, [2, 1]),
      trueShootingPct: deriveTrueShooting(numericCells),
    }),
  },
  rebounding: {
    sourceFields: ["espn.avgRebounds"],
    map: ({ numericCells }) => ({
      rebounding: pickValue(numericCells, [0, 1]),
    }),
  },
  ballControl: {
    sourceFields: ["espn.avgTurnovers", "espn.pace"],
    map: ({ numericCells }) => ({
      ballControl: pickValue(numericCells, [0, 1]),
      pace: derivePaceFromTurnovers(numericCells),
    }),
  },
  freeThrowPct: {
    sourceFields: ["espn.freeThrowPct"],
    map: ({ numericCells }) => ({
      freeThrowPct: pickPercentValue(numericCells, [0, 1]),
    }),
  },
  threePointPct: {
    sourceFields: ["espn.threePointFieldGoalPct"],
    map: ({ numericCells }) => ({
      threePointPct: pickPercentValue(numericCells, [0, 1]),
    }),
  },
  opponentThreePointPct: {
    sourceFields: ["espn.opponentThreePointFieldGoalPct"],
    map: ({ numericCells }) => ({
      opponentThreePointPct: pickPercentValue(numericCells, [0, 1]),
    }),
  },
  bpi: {
    sourceFields: ["espn.bpi.resume", "espn.bpi.rank"],
    map: ({ numericCells, rank }) => ({
      strengthOfSchedule: pickValue(numericCells, [1, 0]) ?? Math.max(40, Number((102 - rank * 1.35).toFixed(1))),
    }),
  },
};

function parseNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
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

function extractTableRows(html: string) {
  const rows = Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));

  return rows
    .map((match) => {
      const cells = Array.from(match[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)).map(
        (cell) => stripHtml(cell[1]),
      );

      return cells.filter(Boolean);
    })
    .filter((cells) => cells.length >= 3);
}

function pickValue(values: number[], indexes: number[]) {
  for (const index of indexes) {
    const value = values[index];
    if (value !== undefined) {
      return Number(value.toFixed(1));
    }
  }

  return null;
}

function pickPercentValue(values: number[], indexes: number[]) {
  const value = pickValue(values, indexes);
  if (value === null) {
    return null;
  }

  return value > 1 && value <= 100 ? value : null;
}

function deriveTrueShooting(values: number[]) {
  const fieldGoal = pickPercentValue(values, [0, 1]);
  const threePoint = pickPercentValue(values, [2, 3, 4]);

  if (fieldGoal === null) {
    return null;
  }

  return Number((fieldGoal + (threePoint ?? fieldGoal * 0.36) * 0.18).toFixed(1));
}

function derivePaceFromTurnovers(values: number[]) {
  const turnovers = pickValue(values, [0, 1]);
  if (turnovers === null) {
    return null;
  }

  return Number((71 - turnovers * 0.45).toFixed(1));
}

function parseEspnTablePage({
  html,
  pageKey,
  teams,
}: {
  html: string;
  pageKey: string;
  teams: Team[];
}) {
  const config = espnPageConfig[pageKey];
  if (!config) {
    return [] as ProviderStatRecord[];
  }

  const rows = extractTableRows(html);
  const records: ProviderStatRecord[] = [];
  const seen = new Set<string>();
  const unresolved = new Set<string>();

  rows.forEach((cells, rowIndex) => {
    const teamCell = cells.find((cell) => matchTeamName(cell, teams, `espn-${pageKey}`).matchedTeam);
    if (!teamCell) {
      const candidate = cells.find((cell) => /[A-Za-z]/.test(cell));
      if (candidate) {
        unresolved.add(candidate);
      }
      return;
    }

    const match = matchTeamName(teamCell, teams, `espn-${pageKey}`);
    if (!match.matchedTeam || seen.has(match.canonicalId)) {
      return;
    }

    const numericCells = cells
      .map((cell) => parseNumber(cell))
      .filter((value): value is number => value !== null);

    if (numericCells.length === 0) {
      return;
    }

    const parsedRow: ParsedEspnRow = {
      rank: rowIndex + 1,
      teamName: teamCell,
      numericCells,
      labelCells: cells,
    };
    const values = config.map(parsedRow);

    records.push({
      teamId: match.canonicalId,
      displayName: match.matchedTeam.name,
      source: pageKey === "bpi" ? "espn-bpi" : "espn-stats",
      sourceFields: config.sourceFields,
      values,
    });
    seen.add(match.canonicalId);
  });

  if (process.env.NODE_ENV !== "production" && unresolved.size > 0) {
    console.warn(
      `[team-stats] unresolved ESPN ${pageKey} teams`,
      Array.from(unresolved).slice(0, 12),
    );
  }

  return records;
}

type EspnBrandingRecord = {
  teamId: string;
  displayName: string;
  logoUrl: string;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  hasLiveLogo: boolean;
};

function matchEspnBrandingTeam(
  teamPayload: Record<string, string>,
  teams: Team[],
) {
  const candidates = [
    teamPayload.nickname,
    teamPayload.displayName,
    teamPayload.shortDisplayName,
    teamPayload.abbrev,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const identity = getCanonicalTeamIdentity(candidate);
    if (canonicalTeamById[identity.id]) {
      const matchedTeam =
        teams.find((team) => team.id === identity.id) ??
        teams.find((team) => getCanonicalTeamIdentity(team.name).id === identity.id) ??
        null;

      return {
        sourceName: candidate,
        canonicalId: identity.id,
        canonicalName: canonicalTeamById[identity.id].displayName,
        confidence: identity.confidence,
        matchedTeam,
      };
    }

    const match = matchTeamName(candidate, teams, "espn-branding");
    if (match.matchedTeam) {
      return match;
    }
  }

  if (process.env.NODE_ENV !== "production" && candidates[0]) {
    const key = normalizeTeamName(candidates[0]);
    if (!unresolvedBrandingNames.has(key)) {
      unresolvedBrandingNames.add(key);
      console.warn(`[team-branding] unresolved ESPN branding team`, candidates);
    }
  }

  return null;
}

export function extractEspnTeamBranding({
  espnPages,
  teams,
}: {
  espnPages: Partial<Record<string, string>>;
  teams: Team[];
}) {
  const brandingByTeamId = new Map<string, EspnBrandingRecord>();
  const teamPattern =
    /"team":\{"id":"([^"]+)","abbrev":"([^"]*)","displayName":"([^"]+)","shortDisplayName":"([^"]*)","logo":"(https?:\/\/[^"]+)".*?"nickname":"([^"]*)"/g;

  for (const html of Object.values(espnPages)) {
    if (!html) {
      continue;
    }

    const matches = html.matchAll(teamPattern);
    for (const matchResult of matches) {
      const [, id, abbrev, displayName, shortDisplayName, logo, nickname] = matchResult;
      if (!logo || !displayName) {
        continue;
      }

      const matchedTeam = matchEspnBrandingTeam(
        {
          id,
          abbrev,
          displayName,
          shortDisplayName,
          logo,
          nickname,
        },
        teams,
      );
      if (!matchedTeam?.matchedTeam) {
        continue;
      }

      if (brandingByTeamId.has(matchedTeam.canonicalId)) {
        continue;
      }

      brandingByTeamId.set(matchedTeam.canonicalId, {
        teamId: matchedTeam.canonicalId,
        displayName:
          matchedTeam.matchedTeam?.name ?? matchedTeam.canonicalName ?? displayName,
        logoUrl: logo,
        logoLightUrl: logo,
        logoDarkUrl: logo,
        hasLiveLogo: true,
      });
    }
  }

  return brandingByTeamId;
}

function parseNcaaStandingsPayload(payload: unknown, teams: Team[]) {
  const conferenceEntries = findArray(payload, [
    ["data"],
    ["standings"],
    ["teams"],
    ["rows"],
    ["conferenceStandings"],
  ]);
  const entries = conferenceEntries.flatMap((entry) => {
    if (Array.isArray(entry.standings)) {
      return entry.standings.filter(
        (standing): standing is GenericRecord =>
          Boolean(standing && typeof standing === "object"),
      );
    }

    return [entry];
  });

  const records: ProviderStatRecord[] = [];

  for (const entry of entries) {
    const rawName = [
      entry.team,
      entry.school,
      entry.name,
      entry.teamName,
      entry.School,
    ].find((value) => typeof value === "string" && value.trim());

    if (typeof rawName !== "string") {
      continue;
    }

    const match = matchTeamName(rawName, teams, "ncaa-standings-stats");
    if (!match.matchedTeam) {
      continue;
    }

    const wins = parseNumber(
      String(entry.wins ?? entry.overallWins ?? entry.w ?? entry["Overall W"] ?? ""),
    );
    const losses = parseNumber(
      String(entry.losses ?? entry.overallLosses ?? entry.l ?? entry["Overall L"] ?? ""),
    );
    const sos = parseNumber(
      String(
        entry.strengthOfSchedule ??
          entry.scheduleStrength ??
          entry.sos ??
          entry.opponentPercentage,
      ),
    );

    if (wins === null && losses === null && sos === null) {
      continue;
    }

    const gamesPlayed = (wins ?? 0) + (losses ?? 0);
    const streakValue =
      typeof entry["Overall STREAK"] === "string" ? String(entry["Overall STREAK"]) : "";
    const streakCount = parseNumber(streakValue) ?? 0;
    const streakBoost = streakValue.includes("Won")
      ? Math.min(8, streakCount * 1.2)
      : streakValue.includes("Lost")
        ? -Math.min(8, streakCount * 1.2)
        : 0;
    const recentForm =
      gamesPlayed > 0
        ? Number(((((wins ?? 0) / gamesPlayed) * 100) + streakBoost).toFixed(1))
        : null;
    const homeAway = recentForm !== null ? Number((recentForm * 0.92 + 4).toFixed(1)) : null;

    records.push({
      teamId: match.canonicalId,
      displayName: match.matchedTeam.name,
      source: "ncaa-api",
      sourceFields: ["ncaa.standings", "ncaa.record"],
      values: {
        strengthOfSchedule: sos,
        recentForm,
        homeAway,
      },
    });
  }

  return records;
}

function parseTorvikSupplement(payload: string | null, teams: Team[]) {
  if (!payload) {
    return [] as ProviderStatRecord[];
  }

  const lines = payload
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [] as ProviderStatRecord[];
  }

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map((header) => normalizeTeamName(header));
  const records: ProviderStatRecord[] = [];

  for (const line of lines.slice(1)) {
    const cells = line.split(delimiter).map((cell) => cell.trim());
    const rawName = cells[0];
    if (!rawName) {
      continue;
    }

    const match = matchTeamName(rawName, teams, "torvik-supplement");
    if (!match.matchedTeam) {
      continue;
    }

    const getCell = (...names: string[]) => {
      for (const name of names) {
        const index = headers.findIndex((header) => header === normalizeTeamName(name));
        if (index >= 0) {
          const parsed = parseNumber(cells[index]);
          if (parsed !== null) {
            return parsed;
          }
        }
      }
      return null;
    };

    const adjustedOffense = getCell("adj o", "adjo", "offense", "oe");
    const adjustedDefense = getCell("adj d", "adjd", "defense", "de");
    const rebounding = getCell("reb", "rebounding", "orbdr");
    const ballControl = getCell("to", "turnovers", "tor");
    const pace = getCell("tempo", "pace");
    const sos = getCell("sos", "schedule");
    const trueShootingPct = getCell("ts%", "true shooting", "ts");

    if (
      adjustedOffense === null &&
      adjustedDefense === null &&
      rebounding === null &&
      pace === null
    ) {
      continue;
    }

    records.push({
      teamId: match.canonicalId,
      displayName: match.matchedTeam.name,
      source: "torvik",
      sourceFields: ["torvik-supplement"],
      values: {
        adjustedOffense,
        adjustedDefense,
        rebounding,
        ballControl,
        pace,
        strengthOfSchedule: sos,
        trueShootingPct,
      },
    });
  }

  return records;
}

function defaultAvailability(source: TeamStatSource) {
  return {
    live: source !== "fallback",
    source,
    fallbackUsed: source === "fallback",
  };
}

function emptyProfile(team: Team): NormalizedTeamStats {
  const fallbackSource = defaultAvailability("fallback");

  return {
    teamId: team.id,
    displayName: team.name,
    updatedAt: new Date().toISOString(),
    source: ["fallback"],
    sourceFields: [],
    isLive: false,
    completeness: 0,
    status: "mock-fallback",
    availability: {
      offense: fallbackSource,
      defense: fallbackSource,
      shooting: fallbackSource,
      rebounding: fallbackSource,
      ballControl: fallbackSource,
      freeThrowPct: fallbackSource,
      threePointPct: fallbackSource,
      opponentThreePointPct: fallbackSource,
      trueShootingPct: fallbackSource,
      strengthOfSchedule: fallbackSource,
      recentForm: fallbackSource,
      homeAway: fallbackSource,
      pace: fallbackSource,
    },
    values: {
      adjustedOffense: null,
      adjustedDefense: null,
      shooting: null,
      rebounding: null,
      ballControl: null,
      freeThrowPct: null,
      threePointPct: null,
      opponentThreePointPct: null,
      trueShootingPct: null,
      strengthOfSchedule: null,
      recentForm: null,
      homeAway: null,
      pace: null,
    },
  };
}

function applyAvailability(
  current: NormalizedTeamStats,
  key: StatValueKey,
  source: TeamStatSource,
) {
  switch (key) {
    case "adjustedOffense":
      current.availability.offense = defaultAvailability(source);
      break;
    case "adjustedDefense":
      current.availability.defense = defaultAvailability(source);
      break;
    case "shooting":
      current.availability.shooting = defaultAvailability(source);
      break;
    case "rebounding":
      current.availability.rebounding = defaultAvailability(source);
      break;
    case "ballControl":
      current.availability.ballControl = defaultAvailability(source);
      break;
    case "freeThrowPct":
      current.availability.freeThrowPct = defaultAvailability(source);
      break;
    case "threePointPct":
      current.availability.threePointPct = defaultAvailability(source);
      break;
    case "opponentThreePointPct":
      current.availability.opponentThreePointPct = defaultAvailability(source);
      break;
    case "trueShootingPct":
      current.availability.trueShootingPct = defaultAvailability(source);
      break;
    case "strengthOfSchedule":
      current.availability.strengthOfSchedule = defaultAvailability(source);
      break;
    case "recentForm":
      current.availability.recentForm = defaultAvailability(source);
      break;
    case "homeAway":
      current.availability.homeAway = defaultAvailability(source);
      break;
    case "pace":
      current.availability.pace = defaultAvailability(source);
      break;
  }
}

function finalizeDerivedValues(profile: NormalizedTeamStats) {
  if (profile.values.trueShootingPct === null && profile.values.shooting !== null) {
    profile.values.trueShootingPct = Number(
      (
        profile.values.shooting +
        ((profile.values.threePointPct ?? profile.values.shooting * 0.35) * 0.18)
      ).toFixed(1),
    );
  }

  if (profile.values.homeAway === null && profile.values.recentForm !== null) {
    profile.values.homeAway = Number((profile.values.recentForm * 0.91 + 4.5).toFixed(1));
  }
}

export function adaptTeamStatsFeeds({
  teams,
  espnPages,
  ncaaStandingsPayload,
  torvikPayload,
  fetchedAt,
}: {
  teams: Team[];
  espnPages: Partial<Record<string, string>>;
  ncaaStandingsPayload?: unknown | null;
  torvikPayload?: string | null;
  fetchedAt: string;
}) {
  const byTeam = new Map<string, NormalizedTeamStats>(
    teams.map((team) => [team.id, emptyProfile(team)]),
  );
  const records = [
    ...Object.entries(espnPages).flatMap(([pageKey, html]) =>
      html ? parseEspnTablePage({ html, pageKey, teams }) : [],
    ),
    ...parseNcaaStandingsPayload(ncaaStandingsPayload, teams),
    ...parseTorvikSupplement(torvikPayload ?? null, teams),
  ];

  for (const record of records) {
    const current = byTeam.get(record.teamId);
    if (!current) {
      continue;
    }

    current.updatedAt = fetchedAt;
    current.isLive = true;
    current.source = Array.from(
      new Set([...current.source.filter((source) => source !== "fallback"), record.source]),
    );
    current.sourceFields = Array.from(
      new Set([...current.sourceFields, ...record.sourceFields]),
    );

    for (const [key, value] of Object.entries(record.values) as Array<
      [StatValueKey, number | null | undefined]
    >) {
      if (value === null || value === undefined) {
        continue;
      }

      current.values[key] = Number(value.toFixed(1));
      applyAvailability(current, key, record.source);
    }
  }

  for (const profile of byTeam.values()) {
    finalizeDerivedValues(profile);
    const liveFields = Object.values(profile.values).filter((value) => value !== null).length;
    profile.completeness = Number((liveFields / Object.keys(profile.values).length).toFixed(2));
    profile.status =
      profile.completeness >= 0.6
        ? "live"
        : profile.completeness > 0
          ? "partial-fallback"
          : "mock-fallback";
  }

  return Array.from(byTeam.values());
}
