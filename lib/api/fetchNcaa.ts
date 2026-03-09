const NCAA_API_BASE =
  process.env.NCAA_API_BASE?.replace(/\/$/, "") ?? "https://ncaa-api.henrygd.me";

type FetchNcaaOptions = {
  revalidate?: number;
  timeoutMs?: number;
};

async function fetchWithTimeout(
  input: string,
  { revalidate = 900, timeoutMs = 8000 }: FetchNcaaOptions = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`NCAA API request failed with ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCandidatePaths(
  paths: string[],
  options?: FetchNcaaOptions,
): Promise<unknown> {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await fetchWithTimeout(`${NCAA_API_BASE}${path}`, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to fetch NCAA data");
}

export function fetchNcaaRankingsFeed() {
  return fetchCandidatePaths([
    "/rankings/basketball-men/d1/associated-press",
    "/rankings/basketball-men/d1/coaches",
  ]);
}

export function fetchNcaaScoreboardFeed() {
  return fetchCandidatePaths([
    "/scoreboard/basketball-men/d1",
    "/scoreboard/basketball-men/d1/current",
  ]);
}

export function fetchNcaaStandingsFeed() {
  return fetchCandidatePaths([
    "/standings/basketball-men/d1",
    "/standings/basketball-men/d1/conference",
  ]);
}

export function fetchNcaaTeamFeed(teamId: string) {
  const cleanTeamId = encodeURIComponent(teamId);

  return fetchCandidatePaths([
    `/team/${cleanTeamId}/basketball-men/d1`,
    `/teams/${cleanTeamId}`,
  ]);
}
