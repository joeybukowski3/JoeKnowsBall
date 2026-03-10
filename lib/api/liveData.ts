import { adaptNcaaGames, adaptNcaaTeams } from "@/lib/adapters/ncaaAdapter";
import { adaptOddsToGameLines, adaptOddsToTeamOdds } from "@/lib/adapters/oddsAdapter";
import {
  fetchNcaaRankingsFeed,
  fetchNcaaScoreboardFeed,
  fetchNcaaStandingsFeed,
  fetchNcaaTeamFeed,
} from "@/lib/api/fetchNcaa";
import { fetchNcaabOddsFeed } from "@/lib/api/fetchOdds";
import {
  games as fallbackGames,
  mockBracketGames,
  mockFutures,
  mockTeams,
  odds as fallbackOdds,
} from "@/lib/data";
import { tournamentField } from "@/lib/data/tournamentField";
import type { DataEnvelope, DataMeta, FuturesMarket, Game, Team } from "@/lib/types";
import { buildTournamentTeams } from "@/lib/utils/buildTournamentBracket";
import { getCanonicalTeamIdentity } from "@/lib/utils/teamMatcher";

function buildMockMeta(provider: string, fallbackReason: string): DataMeta {
  return {
    source: "mock",
    provider,
    fallbackReason,
    updatedAt: new Date().toISOString(),
  };
}

function buildLiveMeta(provider: string): DataMeta {
  return {
    source: "live",
    provider,
    updatedAt: new Date().toISOString(),
  };
}

function mergeGamesWithOdds(games: Game[], lines: ReturnType<typeof adaptOddsToGameLines>) {
  const oddsByMatchup = new Map(
    lines.map((line) => [
      `${getCanonicalTeamIdentity(line.awayTeam).id}::${getCanonicalTeamIdentity(line.homeTeam).id}`,
      line,
    ]),
  );

  return games.map((game) => {
    const match = oddsByMatchup.get(
      `${getCanonicalTeamIdentity(game.awayTeam).id}::${getCanonicalTeamIdentity(game.homeTeam).id}`,
    );

    if (!match) {
      return game;
    }

    return {
      ...game,
      startTime: game.startTime === "TBD" ? match.commenceTime : game.startTime,
      spread: match.spread,
      moneylineHome: match.moneylineHome,
      moneylineAway: match.moneylineAway,
    };
  });
}

function mergeBracketTeamsWithLive(liveTeams: Team[]) {
  return buildTournamentTeams(liveTeams, tournamentField);
}

export async function getNcaaTeamsData(): Promise<DataEnvelope<Team[]>> {
  try {
    const [rankingsResult, standingsResult, scoreboardResult] = await Promise.allSettled([
      fetchNcaaRankingsFeed(),
      fetchNcaaStandingsFeed(),
      fetchNcaaScoreboardFeed(),
    ]);

    const rankingsPayload =
      rankingsResult.status === "fulfilled" ? rankingsResult.value : undefined;
    const standingsPayload =
      standingsResult.status === "fulfilled" ? standingsResult.value : undefined;
    const gamesPayload =
      scoreboardResult.status === "fulfilled" ? scoreboardResult.value : undefined;
    const teams = adaptNcaaTeams({
      rankingsPayload: rankingsPayload ?? standingsPayload,
      gamesPayload,
      fallbackTeams: mockTeams,
    });

    if (teams === mockTeams) {
      return {
        data: mockTeams,
        meta: buildMockMeta("NCAA API", "Live NCAA team feed was unavailable."),
      };
    }

    return {
      data: teams,
      meta: buildLiveMeta("NCAA API"),
    };
  } catch (error) {
    return {
      data: mockTeams,
      meta: buildMockMeta(
        "NCAA API",
        error instanceof Error ? error.message : "Live NCAA team feed failed.",
      ),
    };
  }
}

export async function getNcaaGamesData(teams: Team[]): Promise<DataEnvelope<Game[]>> {
  try {
    const scoreboardPayload = await fetchNcaaScoreboardFeed();
    const games = adaptNcaaGames(scoreboardPayload, teams, fallbackGames);

    if (games === fallbackGames) {
      return {
        data: fallbackGames,
        meta: buildMockMeta("NCAA API", "Live NCAA schedule feed was unavailable."),
      };
    }

    return {
      data: games,
      meta: buildLiveMeta("NCAA API"),
    };
  } catch (error) {
    return {
      data: fallbackGames,
      meta: buildMockMeta(
        "NCAA API",
        error instanceof Error ? error.message : "Live NCAA schedule feed failed.",
      ),
    };
  }
}

export async function getNcaaRankingsData() {
  const teamsResult = await getNcaaTeamsData();

  return {
    data: teamsResult.data.sort((left, right) => left.rank - right.rank),
    meta: teamsResult.meta,
  };
}

export async function getNcaaTeamData(teamId: string) {
  try {
    const [teamsResult, liveTeamPayload] = await Promise.all([
      getNcaaTeamsData(),
      fetchNcaaTeamFeed(teamId),
    ]);
    const adaptedTeams = adaptNcaaTeams({
      rankingsPayload: liveTeamPayload,
      fallbackTeams: teamsResult.data,
    });
    const team =
      adaptedTeams.find((entry) => entry.id === teamId) ??
      teamsResult.data.find((entry) => entry.id === teamId) ??
      null;

    if (!team) {
      return {
        data: null,
        meta: buildMockMeta("NCAA API", "Team could not be resolved."),
      };
    }

    return {
      data: team,
      meta: buildLiveMeta("NCAA API"),
    };
  } catch {
    const team = mockTeams.find((entry) => entry.id === teamId) ?? null;
    return {
      data: team,
      meta: buildMockMeta("NCAA API", "Live team detail feed was unavailable."),
    };
  }
}

export async function getNcaabOddsData(teams: Team[] = mockTeams) {
  try {
    const payload = await fetchNcaabOddsFeed();
    const lines = adaptOddsToGameLines(payload, teams);
    const oddsRows = adaptOddsToTeamOdds(lines);

    if (lines.length === 0) {
      return {
        data: {
          lines: [],
          odds: fallbackOdds,
        },
        meta: buildMockMeta("The Odds API", "Live odds feed returned no usable markets."),
      };
    }

    return {
      data: {
        lines,
        odds: oddsRows,
      },
      meta: buildLiveMeta("The Odds API"),
    };
  } catch (error) {
    return {
      data: {
        lines: [],
        odds: fallbackOdds,
      },
      meta: buildMockMeta(
        "The Odds API",
        error instanceof Error ? error.message : "Live odds feed failed.",
      ),
    };
  }
}

export async function getFuturesData(): Promise<DataEnvelope<FuturesMarket[]>> {
  return {
    data: mockFutures,
    meta: buildMockMeta("Internal", "Title futures remain mock for the first live pass."),
  };
}

export async function getNcaaDashboardData() {
  const teamsResult = await getNcaaTeamsData();
  const [gamesResult, oddsResult] = await Promise.all([
    getNcaaGamesData(teamsResult.data),
    getNcaabOddsData(teamsResult.data),
  ]);

  const enrichedGames = mergeGamesWithOdds(gamesResult.data, oddsResult.data.lines);
  const pageSource =
    teamsResult.meta.source === "live" && gamesResult.meta.source === "live"
      ? "live"
      : "mock";

  return {
    teams: teamsResult.data,
    games: enrichedGames,
    odds: oddsResult.data.odds,
    meta: {
      source: pageSource,
      provider:
        pageSource === "live" ? "NCAA API + The Odds API" : "Mock fallback",
      fallbackReason:
        pageSource === "mock"
          ? teamsResult.meta.fallbackReason ?? gamesResult.meta.fallbackReason
          : undefined,
      updatedAt: new Date().toISOString(),
    } satisfies DataMeta,
  };
}

export async function getMatchupPageData() {
  const dashboardData = await getNcaaDashboardData();

  return {
    teams: dashboardData.teams,
    games: dashboardData.games,
    meta: dashboardData.meta,
  };
}

export async function getBettingPageData() {
  const [dashboardData, futuresResult] = await Promise.all([
    getNcaaDashboardData(),
    getFuturesData(),
  ]);

  return {
    teams: dashboardData.teams,
    bracketTeams: mergeBracketTeamsWithLive(dashboardData.teams),
    games: dashboardData.games,
    futuresMarkets: futuresResult.data,
    bracketGames: mockBracketGames,
    meta: {
      source: dashboardData.meta.source,
      provider: dashboardData.meta.provider,
      fallbackReason: dashboardData.meta.fallbackReason ?? futuresResult.meta.fallbackReason,
      updatedAt: new Date().toISOString(),
    } satisfies DataMeta,
  };
}

export async function getNcaaTeamPageData(teamId: string) {
  const [bettingData, teamResult] = await Promise.all([
    getBettingPageData(),
    getNcaaTeamData(teamId),
  ]);

  const detailedTeam = teamResult.data;
  const teams = detailedTeam
    ? bettingData.teams.map((team) => (team.id === teamId ? { ...team, ...detailedTeam } : team))
    : bettingData.teams;
  const bracketTeams = detailedTeam
    ? bettingData.bracketTeams.map((team) =>
        team.id === teamId ? { ...team, ...detailedTeam, seed: team.seed ?? detailedTeam.seed } : team,
      )
    : bettingData.bracketTeams;
  const team =
    teams.find((entry) => entry.id === teamId) ??
    bracketTeams.find((entry) => entry.id === teamId) ??
    null;

  return {
    ...bettingData,
    teams,
    bracketTeams,
    team,
    teamMeta: teamResult.meta,
  };
}
