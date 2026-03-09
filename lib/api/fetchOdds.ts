const ODDS_API_BASE =
  process.env.ODDS_API_BASE?.replace(/\/$/, "") ?? "https://api.the-odds-api.com/v4";

type FetchOddsOptions = {
  revalidate?: number;
  timeoutMs?: number;
};

function getOddsApiKey() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    throw new Error("ODDS_API_KEY is not set");
  }

  return apiKey;
}

async function fetchWithTimeout(
  input: string,
  { revalidate = 300, timeoutMs = 8000 }: FetchOddsOptions = {},
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
      throw new Error(`Odds API request failed with ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function fetchNcaabOddsFeed() {
  const params = new URLSearchParams({
    apiKey: getOddsApiKey(),
    regions: "us",
    markets: "h2h,spreads",
    oddsFormat: "american",
    dateFormat: "iso",
    bookmakers: "draftkings,fanduel,betmgm,caesars,pinnacle",
  });

  return fetchWithTimeout(`${ODDS_API_BASE}/sports/basketball_ncaab/odds/?${params.toString()}`);
}
