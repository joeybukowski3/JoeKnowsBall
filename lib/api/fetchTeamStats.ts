const ESPN_BASE = "https://www.espn.com/mens-college-basketball";
const TORVIK_STATS_URL = process.env.TORVIK_STATS_URL?.trim() ?? "";

type FetchStatsOptions = {
  revalidate?: number;
  timeoutMs?: number;
};

export type TeamStatsFeedBundle = {
  fetchedAt: string;
  ncaaStandingsPayload: unknown | null;
  espnPages: Partial<Record<EspnStatsPageKey, string>>;
  torvikPayload: string | null;
};

export type EspnStatsPageKey =
  | "offense"
  | "defense"
  | "shooting"
  | "rebounding"
  | "ballControl"
  | "freeThrowPct"
  | "threePointPct"
  | "opponentThreePointPct"
  | "bpi";

const currentSeason = new Date().getFullYear();

const espnPagePaths: Record<EspnStatsPageKey, string> = {
  offense: `/stats/team/_/view/team/season/${currentSeason}/seasontype/2/table/offensive/sort/avgPoints/dir/desc`,
  defense: `/stats/team/_/view/opponent/season/${currentSeason}/seasontype/2/table/defensive/sort/avgPoints/dir/asc`,
  shooting: `/stats/team/_/view/team/season/${currentSeason}/seasontype/2/table/offensive/sort/fieldGoalPct/dir/desc`,
  rebounding: `/stats/team/_/view/team/season/${currentSeason}/seasontype/2/table/general/sort/avgRebounds/dir/desc`,
  ballControl: `/stats/team/_/view/team/season/${currentSeason}/seasontype/2/table/general/sort/avgTurnovers/dir/asc`,
  freeThrowPct: `/stats/team/_/view/team/season/${currentSeason}/seasontype/2/table/offensive/sort/freeThrowPct/dir/desc`,
  threePointPct: `/stats/team/_/view/team/season/${currentSeason}/seasontype/2/table/offensive/sort/threePointFieldGoalPct/dir/desc`,
  opponentThreePointPct: `/stats/team/_/view/opponent/season/${currentSeason}/seasontype/2/table/defensive/sort/threePointFieldGoalPct/dir/asc`,
  bpi: `/bpi/_/view/resume/sort/resume/dir/desc`,
};

async function fetchTextWithTimeout(
  input: string,
  { revalidate = 3600, timeoutMs = 10000 }: FetchStatsOptions = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      headers: {
        Accept: "text/html,application/json,text/plain",
        "User-Agent": "Mozilla/5.0 JoeKnowsBall/1.0",
      },
      next: {
        revalidate,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Team stats request failed with ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchEspnTeamStatsPages(options?: FetchStatsOptions) {
  const entries = await Promise.allSettled(
    Object.entries(espnPagePaths).map(async ([key, path]) => [
      key as EspnStatsPageKey,
      await fetchTextWithTimeout(`${ESPN_BASE}${path}`, options),
    ] as const),
  );

  const pages: Partial<Record<EspnStatsPageKey, string>> = {};

  for (const entry of entries) {
    if (entry.status !== "fulfilled") {
      continue;
    }

    const [key, value] = entry.value;
    pages[key] = value;
  }

  return pages;
}

export async function fetchTorvikSupplement(options?: FetchStatsOptions) {
  if (!TORVIK_STATS_URL) {
    return null;
  }

  try {
    return await fetchTextWithTimeout(TORVIK_STATS_URL, options);
  } catch {
    return null;
  }
}

export async function fetchTeamStatsBundle({
  standingsPayload,
}: {
  standingsPayload?: unknown;
} = {}): Promise<TeamStatsFeedBundle> {
  const [espnPages, torvikPayload] = await Promise.all([
    fetchEspnTeamStatsPages(),
    fetchTorvikSupplement(),
  ]);

  return {
    fetchedAt: new Date().toISOString(),
    ncaaStandingsPayload: standingsPayload ?? null,
    espnPages,
    torvikPayload,
  };
}
