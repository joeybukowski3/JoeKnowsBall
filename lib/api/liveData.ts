import { adaptNcaaGames, adaptNcaaTeams } from "@/lib/adapters/ncaaAdapter";
import { adaptOddsToGameLines, adaptOddsToTeamOdds } from "@/lib/adapters/oddsAdapter";
import { adaptTeamStatsFeeds, extractEspnTeamBranding } from "@/lib/adapters/teamStatsAdapter";
import {
  fetchNcaaRankingsFeed,
  fetchNcaaScoreboardFeed,
  fetchNcaaStandingsFeed,
  fetchNcaaTeamFeed,
} from "@/lib/api/fetchNcaa";
import { fetchNcaabOddsFeed } from "@/lib/api/fetchOdds";
import { fetchTeamStatsBundle } from "@/lib/api/fetchTeamStats";
import {
  games as fallbackGames,
  mockBracketGames,
  mockFutures,
  mockTeams,
  odds as fallbackOdds,
} from "@/lib/data";
import { tournamentField } from "@/lib/data/tournamentField";
import type {
  DataEnvelope,
  DataMeta,
  FuturesMarket,
  Game,
  NormalizedTeamStats,
  Team,
} from "@/lib/types";
import { buildTournamentTeams } from "@/lib/utils/buildTournamentBracket";
import { mergeStatsIntoTeams } from "@/lib/utils/statMerge";
import { getStatsStatus, logStatDiagnostics } from "@/lib/utils/statAvailability";
import { getCanonicalTeamIdentity } from "@/lib/utils/teamMatcher";
import type { TeamStatsFeedBundle } from "@/lib/api/fetchTeamStats";

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

function buildTeamStatsEnvelope(
  teams: Team[],
  feeds: TeamStatsFeedBundle,
): DataEnvelope<NormalizedTeamStats[]> {
  const normalized = adaptTeamStatsFeeds({
    teams,
    espnPages: feeds.espnPages,
    ncaaStandingsPayload: feeds.ncaaStandingsPayload,
    torvikPayload: feeds.torvikPayload,
    fetchedAt: feeds.fetchedAt,
  });
  const statsStatus = getStatsStatus(normalized);
  logStatDiagnostics(normalized);

  return {
    data: normalized,
    meta:
      statsStatus === "Mock Fallback"
        ? buildMockMeta(
            feeds.torvikPayload ? "ESPN + NCAA API + Torvik supplement" : "ESPN + NCAA API",
            "Live stat coverage was unavailable.",
          )
        : {
            source: statsStatus === "Live Stats" ? "live" : "mock",
            provider: feeds.torvikPayload
              ? "ESPN + NCAA API + Torvik supplement"
              : "ESPN + NCAA API",
            fallbackReason:
              statsStatus === "Partial Fallback"
                ? "Partial stat coverage; fallback values are still filling missing categories."
                : undefined,
            updatedAt: feeds.fetchedAt,
          },
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

function mergeTeamLogos(
  teams: Team[],
  brandingByTeamId: Map<
    string,
    {
      logoUrl: string;
      logoLightUrl: string | null;
      logoDarkUrl: string | null;
      hasLiveLogo: boolean;
    }
  >,
) {
  return teams.map((team) => {
    const branding = brandingByTeamId.get(team.id);
    if (!branding) {
      return team;
    }

    return {
      ...team,
      logo: branding.logoUrl,
      logoUrl: branding.logoUrl,
      logoLightUrl: branding.logoLightUrl,
      logoDarkUrl: branding.logoDarkUrl,
      hasLiveLogo: branding.hasLiveLogo,
    };
  });
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
    const statFeeds = await fetchTeamStatsBundle({ standingsPayload });
    const teamStats = buildTeamStatsEnvelope(teams, statFeeds);
    const teamBranding = extractEspnTeamBranding({
      espnPages: statFeeds.espnPages,
      teams,
    });
    const enrichedTeams = mergeTeamLogos(
      mergeStatsIntoTeams(teams, teamStats.data),
      teamBranding,
    );

    if (teams === mockTeams) {
      return {
        data: mergeTeamLogos(mergeStatsIntoTeams(mockTeams, teamStats.data), teamBranding),
        meta: buildMockMeta("NCAA API", "Live NCAA team feed was unavailable."),
      };
    }

    return {
      data: enrichedTeams,
      meta: buildLiveMeta("NCAA API"),
    };
  } catch (error) {
    const teamStats = await getNcaaTeamStatsData(mockTeams);
    return {
      data: mergeStatsIntoTeams(mockTeams, teamStats.data),
      meta: buildMockMeta(
        "NCAA API",
        error instanceof Error ? error.message : "Live NCAA team feed failed.",
      ),
    };
  }
}

export async function getNcaaTeamStatsData(
  teams: Team[] = mockTeams,
  standingsPayload?: unknown,
): Promise<DataEnvelope<NormalizedTeamStats[]>> {
  try {
    const feeds = await fetchTeamStatsBundle({ standingsPayload });
    return buildTeamStatsEnvelope(teams, feeds);
  } catch (error) {
    return {
      data: teams.map((team) => ({
        teamId: team.id,
        displayName: team.name,
        updatedAt: new Date().toISOString(),
        source: ["fallback"],
        sourceFields: [],
        isLive: false,
        completeness: 0,
        status: "mock-fallback",
        availability: {
          offense: { live: false, source: "fallback", fallbackUsed: true },
          defense: { live: false, source: "fallback", fallbackUsed: true },
          shooting: { live: false, source: "fallback", fallbackUsed: true },
          rebounding: { live: false, source: "fallback", fallbackUsed: true },
          ballControl: { live: false, source: "fallback", fallbackUsed: true },
          freeThrowPct: { live: false, source: "fallback", fallbackUsed: true },
          threePointPct: { live: false, source: "fallback", fallbackUsed: true },
          opponentThreePointPct: { live: false, source: "fallback", fallbackUsed: true },
          trueShootingPct: { live: false, source: "fallback", fallbackUsed: true },
          strengthOfSchedule: { live: false, source: "fallback", fallbackUsed: true },
          recentForm: { live: false, source: "fallback", fallbackUsed: true },
          homeAway: { live: false, source: "fallback", fallbackUsed: true },
          pace: { live: false, source: "fallback", fallbackUsed: true },
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
      })),
      meta: buildMockMeta(
        "ESPN + NCAA API",
        error instanceof Error ? error.message : "Live stat ingestion failed.",
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
      updatedAt: teamsResult.meta.updatedAt ?? new Date().toISOString(),
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
      updatedAt: dashboardData.meta.updatedAt ?? new Date().toISOString(),
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
