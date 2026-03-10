import type {
  BestBetRow,
  FuturesMarket,
  Game,
  RankingPreset,
  Team,
  UpsetPredictionRow,
} from "@/lib/types";
import { buildFuturesValueRows, buildGameValueRows } from "@/lib/utils/insightBuilders";
import { formatAmericanOdds } from "@/lib/utils/oddsCalculator";
import { buildUpsetPredictions } from "@/lib/utils/upsetPredictor";
import {
  getBestBetValueTier,
  getConfidenceTier,
  getSpreadBestBetValueTier,
} from "@/lib/utils/valueRatings";

function getMoneylineReasons(row: ReturnType<typeof buildGameValueRows>[number]) {
  const reasons: string[] = [];

  if (row.awayTeam.metrics.recentForm > row.homeTeam.metrics.recentForm + 3) {
    reasons.push("Better recent form");
  }

  if (row.awayTeam.metrics.defense < row.homeTeam.metrics.defense - 2) {
    reasons.push("Defensive edge");
  }

  if (Math.abs(row.moneylineEdge) >= 0.055) {
    reasons.push("Model-market gap");
  }

  return reasons.slice(0, 3);
}

function getSpreadReasons(row: ReturnType<typeof buildGameValueRows>[number]) {
  const reasons: string[] = [];

  if (Math.abs(row.spreadEdge) >= 3) {
    reasons.push("Big spread discrepancy");
  }

  if (row.awayTeam.metrics.rebounding > row.homeTeam.metrics.rebounding + 2) {
    reasons.push("Rebounding edge");
  }

  if (row.awayTeam.metrics.shooting > row.homeTeam.metrics.shooting + 2) {
    reasons.push("Shooting profile advantage");
  }

  return reasons.slice(0, 3);
}

function getFuturesReasons(row: ReturnType<typeof buildFuturesValueRows>["futuresRows"][number]) {
  const reasons: string[] = [];

  if (row.modelTitleProbability - row.impliedTitleProbability >= 0.04) {
    reasons.push("Model title probability beats market");
  }

  if (row.pathDifficulty <= 72) {
    reasons.push("Manageable tournament path");
  }

  if (row.rank <= 8) {
    reasons.push("Top-tier model rank");
  }

  return reasons.slice(0, 3);
}

function buildMoneylineRows(gameRows: ReturnType<typeof buildGameValueRows>) {
  return gameRows.map((row) => {
    const volatility =
      row.upsetRisk === "High" ? 0.58 : row.upsetRisk === "Medium" ? 0.44 : 0.26;

    return {
      id: `${row.game.id}-moneyline`,
      marketType: "moneyline",
      matchup: row.matchup,
      selection: `${row.awayTeam.shortName} ML`,
      team: row.awayTeam,
      opponent: row.homeTeam,
      startTime: row.game.startTime,
      edge: row.moneylineEdge,
      modelProbability: row.modelWinProbability,
      impliedProbability: row.impliedWinProbability,
      line: formatAmericanOdds(row.sportsbookMoneyline),
      valueTier: getBestBetValueTier(row.moneylineEdge),
      confidenceTier: getConfidenceTier({
        probability: row.modelWinProbability,
        edge: row.moneylineEdge,
        volatility,
      }),
      volatilityScore: volatility,
      reasons: getMoneylineReasons(row),
      sourceGame: row,
    } satisfies BestBetRow;
  });
}

function buildSpreadRows(gameRows: ReturnType<typeof buildGameValueRows>) {
  return gameRows.map((row) => {
    const volatility = Math.max(0.18, 0.56 - Math.abs(row.spreadEdge) * 0.04);
    const side =
      row.modelSpread <= row.sportsbookSpread ? row.awayTeam.shortName : row.homeTeam.shortName;
    const line =
      row.modelSpread <= row.sportsbookSpread
        ? `${row.awayTeam.shortName} ${row.sportsbookSpread > 0 ? "+" : ""}${row.sportsbookSpread.toFixed(1)}`
        : `${row.homeTeam.shortName} ${row.sportsbookSpread < 0 ? "+" : "-"}${Math.abs(row.sportsbookSpread).toFixed(1)}`;

    return {
      id: `${row.game.id}-spread`,
      marketType: "spread",
      matchup: row.matchup,
      selection: side,
      team: row.modelSpread <= row.sportsbookSpread ? row.awayTeam : row.homeTeam,
      opponent: row.modelSpread <= row.sportsbookSpread ? row.homeTeam : row.awayTeam,
      startTime: row.game.startTime,
      edge: row.spreadEdge / 10,
      modelProbability: row.modelWinProbability,
      impliedProbability: 0.5,
      line,
      valueTier: getSpreadBestBetValueTier(row.spreadEdge),
      confidenceTier: getConfidenceTier({
        probability: Math.max(0.5, row.modelWinProbability),
        edge: row.spreadEdge / 10,
        volatility,
      }),
      volatilityScore: volatility,
      reasons: getSpreadReasons(row),
      sourceGame: row,
    } satisfies BestBetRow;
  });
}

function buildFuturesBetRows(
  futuresRows: ReturnType<typeof buildFuturesValueRows>["futuresRows"],
) {
  return futuresRows.map((row) => {
    const volatility = row.pathDifficulty >= 78 ? 0.58 : row.pathDifficulty >= 70 ? 0.42 : 0.28;

    return {
      id: `${row.team.id}-futures`,
      marketType: "futures",
      matchup: `${row.team.name} title futures`,
      selection: `${row.team.shortName} to win title`,
      team: row.team,
      edge: row.futuresEdge,
      modelProbability: row.modelTitleProbability,
      impliedProbability: row.impliedTitleProbability,
      line: formatAmericanOdds(row.titleOdds),
      valueTier: getBestBetValueTier(row.futuresEdge),
      confidenceTier: getConfidenceTier({
        probability: row.modelTitleProbability,
        edge: row.futuresEdge,
        volatility,
      }),
      volatilityScore: volatility,
      reasons: getFuturesReasons(row),
      sourceFuture: row,
    } satisfies BestBetRow;
  });
}

export function buildBestBetsSnapshot({
  teams,
  bracketTeams,
  games,
  futuresMarkets,
  bracketGames,
  preset,
}: {
  teams: Team[];
  bracketTeams: Team[];
  games: Game[];
  futuresMarkets: FuturesMarket[];
  bracketGames: import("@/lib/types").BracketGameNode[];
  preset: RankingPreset;
}) {
  const gameRows = buildGameValueRows({ teams, games, preset });
  const futuresResult = buildFuturesValueRows({
    bracketTeams,
    futuresMarkets,
    preset,
    bracketGames,
  });
  const moneylineRows = buildMoneylineRows(gameRows).sort((left, right) => right.edge - left.edge);
  const spreadRows = buildSpreadRows(gameRows).sort((left, right) => Math.abs(right.edge) - Math.abs(left.edge));
  const futuresRows = buildFuturesBetRows(futuresResult.futuresRows).sort(
    (left, right) => right.edge - left.edge,
  );
  const upsetPredictions = buildUpsetPredictions(gameRows);

  const allBets = [...moneylineRows, ...spreadRows, ...futuresRows].sort((left, right) => {
    if (right.edge !== left.edge) {
      return right.edge - left.edge;
    }

    return left.volatilityScore - right.volatilityScore;
  });

  const highestConfidence = [...allBets]
    .sort((left, right) => {
      const confidenceRank = (value: BestBetRow["confidenceTier"]) =>
        value === "High Confidence" ? 3 : value === "Medium Confidence" ? 2 : 1;
      const confidenceDiff = confidenceRank(right.confidenceTier) - confidenceRank(left.confidenceTier);
      if (confidenceDiff !== 0) {
        return confidenceDiff;
      }

      return right.edge - left.edge;
    })
    .slice(0, 5);

  const highRiskReward = [...allBets]
    .filter((row) => row.confidenceTier === "Volatile" || row.valueTier === "Elite Value")
    .sort((left, right) => right.edge - left.edge)
    .slice(0, 5);

  return {
    gameRows,
    futuresRows: futuresResult.futuresRows,
    simulationResult: futuresResult.simulationResult,
    pathRows: futuresResult.pathRows,
    rankingRows: futuresResult.bracketRankingRows,
    moneylineRows,
    spreadRows,
    futuresBetRows: futuresRows,
    upsetPredictions,
    allBets,
    bestOverall: allBets.slice(0, 5),
    highestConfidence,
    highRiskReward,
    strongestMoneyline: moneylineRows[0] ?? null,
    strongestSpread: spreadRows[0] ?? null,
    strongestFuture: futuresRows[0] ?? null,
    strongestUpset: upsetPredictions[0] ?? null,
  };
}

export function filterBestBetRows(
  rows: BestBetRow[],
  sortBy: "edge" | "confidence" | "upset" | "futures",
) {
  return [...rows].sort((left, right) => {
    switch (sortBy) {
      case "confidence": {
        const rank = (value: BestBetRow["confidenceTier"]) =>
          value === "High Confidence" ? 3 : value === "Medium Confidence" ? 2 : 1;
        return rank(right.confidenceTier) - rank(left.confidenceTier) || right.edge - left.edge;
      }
      case "futures":
        return (right.marketType === "futures" ? right.edge : -1) - (left.marketType === "futures" ? left.edge : -1);
      case "upset":
        return left.volatilityScore - right.volatilityScore;
      case "edge":
      default:
        return right.edge - left.edge;
    }
  });
}

export function filterUpsetPredictions(
  rows: UpsetPredictionRow[],
  sortBy: "edge" | "confidence" | "upset" | "futures",
) {
  return [...rows].sort((left, right) => {
    switch (sortBy) {
      case "confidence": {
        const rank = (value: UpsetPredictionRow["confidenceTier"]) =>
          value === "High Confidence" ? 3 : value === "Medium Confidence" ? 2 : 1;
        return rank(right.confidenceTier) - rank(left.confidenceTier) || right.upsetProbability - left.upsetProbability;
      }
      case "upset":
        return right.upsetProbability - left.upsetProbability;
      case "edge":
      case "futures":
      default:
        return Math.abs(right.sourceGame.moneylineEdge) - Math.abs(left.sourceGame.moneylineEdge);
    }
  });
}
