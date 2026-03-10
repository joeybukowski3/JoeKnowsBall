import type {
  BracketGameNode,
  FuturesMarket,
  FuturesValueRow,
  Game,
  GameValueRow,
  PathDifficultyRow,
  RankingPreset,
  ResolvedBracketGame,
  Team,
  TournamentSimulationResult,
} from "@/lib/types";
import { matchupEngine } from "@/lib/utils/matchupEngine";
import { americanToImpliedProbability } from "@/lib/utils/oddsCalculator";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import {
  buildBracketRankingRows,
  getUpsetRisk,
  tournamentSimulator,
} from "@/lib/utils/tournamentSimulator";
import { matchTeamName } from "@/lib/utils/teamMatcher";
import { getSpreadValueTier, getValueTier } from "@/lib/utils/valueRatings";

function upsetRiskScore(risk: GameValueRow["upsetRisk"] | ResolvedBracketGame["upsetRisk"]) {
  switch (risk) {
    case "High":
      return 4;
    case "Medium":
      return 3;
    case "Toss-Up":
      return 2;
    default:
      return 1;
  }
}

function tierScore(tier: GameValueRow["valueTier"]) {
  switch (tier) {
    case "Strong":
      return 4;
    case "Medium":
      return 3;
    case "Small":
      return 2;
    default:
      return 1;
  }
}

function strongestTier(
  moneylineTier: GameValueRow["valueTier"],
  spreadTier: GameValueRow["valueTier"],
): GameValueRow["valueTier"] {
  return tierScore(moneylineTier) >= tierScore(spreadTier) ? moneylineTier : spreadTier;
}

function getFallbackTitleProbability(rank: number, pathDifficultyScore: number) {
  const baseline = Math.max(0.012, 0.19 - rank * 0.012);
  const pathPenalty = pathDifficultyScore * 0.0008;
  return Math.max(0.005, baseline - pathPenalty);
}

export function buildGameValueRows({
  teams,
  games,
  preset,
}: {
  teams: Team[];
  games: Game[];
  preset: RankingPreset;
}) {
  return games
    .map((game) => {
      const awayTeam = matchTeamName(game.awayTeam, teams, "insights-away").matchedTeam;
      const homeTeam = matchTeamName(game.homeTeam, teams, "insights-home").matchedTeam;

      if (!awayTeam || !homeTeam) {
        return null;
      }

      const summary = matchupEngine({
        allTeams: teams,
        teamA: awayTeam,
        teamB: homeTeam,
        preset,
        game,
      });
      const sportsbookSpread = -game.spread;
      const modelSpread = summary.modelSpread;
      const spreadEdge = Number((modelSpread - sportsbookSpread).toFixed(1));
      const sportsbookMoneyline = game.moneylineAway;
      const impliedWinProbability = americanToImpliedProbability(sportsbookMoneyline);
      const moneylineEdge = summary.teamA.winProbability - impliedWinProbability;
      const upsetRisk = getUpsetRisk(
        {
          team: awayTeam,
          seed: awayTeam.seed ? Number(awayTeam.seed) : null,
          modelScore: summary.teamA.overallScore,
          rank: summary.teamA.rank,
          winProbability: summary.teamA.winProbability,
        },
        {
          team: homeTeam,
          seed: homeTeam.seed ? Number(homeTeam.seed) : null,
          modelScore: summary.teamB.overallScore,
          rank: summary.teamB.rank,
          winProbability: summary.teamB.winProbability,
        },
      );

      return {
        game,
        awayTeam,
        homeTeam,
        matchup: `${awayTeam.name} at ${homeTeam.name}`,
        sportsbookSpread,
        modelSpread,
        spreadEdge,
        sportsbookMoneyline,
        modelWinProbability: summary.teamA.winProbability,
        impliedWinProbability,
        moneylineEdge,
        upsetRisk,
        valueTier: strongestTier(getValueTier(moneylineEdge), getSpreadValueTier(spreadEdge)),
      } satisfies GameValueRow;
    })
    .filter((row): row is GameValueRow => Boolean(row));
}

export function buildFuturesValueRows({
  bracketTeams,
  futuresMarkets,
  preset,
  bracketGames,
}: {
  bracketTeams: Team[];
  futuresMarkets: FuturesMarket[];
  preset: RankingPreset;
  bracketGames: BracketGameNode[];
}) {
  const bracketRankingRows = buildBracketRankingRows(bracketTeams, preset);
  const rankingByName = new Map(bracketRankingRows.map((row) => [row.team.name, row]));
  const pathRows = pathDifficulty(bracketTeams, bracketGames, bracketRankingRows);
  const simulationResult = tournamentSimulator({
    teams: bracketTeams,
    bracketGames,
    preset,
    iterations: 2500,
  });
  const simulationByName = new Map(
    (simulationResult.rows ?? []).map((row) => [row.team.name, row]),
  );

  const futuresRows = futuresMarkets
    .map((market) => {
      const matchedTeam = matchTeamName(
        market.team,
        bracketTeams,
        "insights-futures",
      ).matchedTeam;
      const rankRow = matchedTeam ? rankingByName.get(matchedTeam.name) : null;

      if (!matchedTeam || !rankRow) {
        return null;
      }

      const pathRow = pathRows.find((row) => row.team.id === matchedTeam.id);
      const simulationRow = simulationByName.get(matchedTeam.name);
      const impliedTitleProbability = americanToImpliedProbability(market.titleOdds);
      const modelTitleProbability =
        simulationRow?.champion ??
        getFallbackTitleProbability(rankRow.rank, pathRow?.pathDifficulty ?? 0);

      return {
        team: matchedTeam,
        rank: rankRow.rank,
        titleOdds: market.titleOdds,
        impliedTitleProbability,
        modelTitleProbability,
        futuresEdge: modelTitleProbability - impliedTitleProbability,
        pathDifficulty: pathRow?.pathDifficulty ?? 0,
        valueTier: getValueTier(modelTitleProbability - impliedTitleProbability),
      } satisfies FuturesValueRow;
    })
    .filter((row): row is FuturesValueRow => Boolean(row));

  return {
    futuresRows,
    simulationResult,
    pathRows,
    bracketRankingRows,
  };
}

export function buildTopValuePlays(rows: GameValueRow[], limit = 5) {
  return [...rows]
    .sort((left, right) => Math.abs(right.moneylineEdge) - Math.abs(left.moneylineEdge))
    .slice(0, limit);
}

export function buildTopSpreadEdges(rows: GameValueRow[], limit = 5) {
  return [...rows]
    .sort((left, right) => Math.abs(right.spreadEdge) - Math.abs(left.spreadEdge))
    .slice(0, limit);
}

export function buildUpsetWatch(rows: GameValueRow[], limit = 5) {
  return [...rows]
    .sort((left, right) => {
      const riskDiff = upsetRiskScore(right.upsetRisk) - upsetRiskScore(left.upsetRisk);
      if (riskDiff !== 0) {
        return riskDiff;
      }

      return Math.abs(right.moneylineEdge) - Math.abs(left.moneylineEdge);
    })
    .slice(0, limit);
}

export function buildBracketUpsetWatch(rows: ResolvedBracketGame[], limit = 5) {
  return [...rows]
    .sort((left, right) => upsetRiskScore(right.upsetRisk) - upsetRiskScore(left.upsetRisk))
    .slice(0, limit);
}

export function buildFuturesValueWatch(rows: FuturesValueRow[], limit = 5) {
  return [...rows]
    .sort((left, right) => right.futuresEdge - left.futuresEdge)
    .slice(0, limit);
}

export function buildEasiestPaths(rows: PathDifficultyRow[], limit = 5) {
  return [...rows]
    .sort((left, right) => left.pathDifficulty - right.pathDifficulty)
    .slice(0, limit);
}

export function buildHardestPaths(rows: PathDifficultyRow[], limit = 5) {
  return [...rows]
    .sort((left, right) => right.pathDifficulty - left.pathDifficulty)
    .slice(0, limit);
}

export function buildChampionProbabilities(
  simulation: TournamentSimulationResult | null,
  limit = 10,
) {
  return [...(simulation?.rows ?? [])]
    .sort((left, right) => right.champion - left.champion)
    .slice(0, limit);
}

export function buildFinalFourProbabilities(
  simulation: TournamentSimulationResult | null,
  limit = 4,
) {
  return [...(simulation?.rows ?? [])]
    .sort((left, right) => right.finalFour - left.finalFour)
    .slice(0, limit);
}

export function buildBracketCheatSheet({
  bracketTeams,
  bracketRankingRows,
  futuresRows,
  simulation,
  pathRows,
  upsetRows,
}: {
  bracketTeams: Team[];
  bracketRankingRows: ReturnType<typeof buildBracketRankingRows>;
  futuresRows: FuturesValueRow[];
  simulation: TournamentSimulationResult | null;
  pathRows: PathDifficultyRow[];
  upsetRows: GameValueRow[];
}) {
  const rankingById = new Map(bracketRankingRows.map((row) => [row.team.id, row]));
  const regionStrength = ["East", "West", "South", "Midwest"]
    .map((region) => {
      const regionTeams = bracketTeams.filter((team) => team.conference === `${region} League`);
      const average =
        regionTeams.reduce(
          (sum, team) => sum + (rankingById.get(team.id)?.overallScore ?? 0),
          0,
        ) / Math.max(regionTeams.length, 1);

      return { region, average };
    })
    .sort((left, right) => right.average - left.average);

  const finalFourRows = buildFinalFourProbabilities(simulation, 8);

  return {
    strongestTopSeeds: bracketTeams
      .filter((team) => {
        const seed = Number(team.seed);
        return Number.isFinite(seed) && seed >= 1 && seed <= 4;
      })
      .sort(
        (left, right) =>
          (rankingById.get(right.id)?.overallScore ?? 0) -
          (rankingById.get(left.id)?.overallScore ?? 0),
      )
      .slice(0, 5),
    dangerousLowerSeeds: bracketTeams
      .filter((team) => {
        const seed = Number(team.seed);
        return Number.isFinite(seed) && seed >= 8;
      })
      .sort(
        (left, right) =>
          (rankingById.get(right.id)?.overallScore ?? 0) -
          (rankingById.get(left.id)?.overallScore ?? 0),
      )
      .slice(0, 5),
    mostUpsetProneGames: buildUpsetWatch(upsetRows, 5),
    bestTitleValues: buildFuturesValueWatch(futuresRows, 5),
    bestFinalFourValues: finalFourRows.slice(0, 5),
    strongestRegion: regionStrength[0] ?? null,
    weakestRegion: regionStrength[regionStrength.length - 1] ?? null,
    easiestPaths: buildEasiestPaths(pathRows, 5),
  };
}
