import type {
  BettingConfidenceTier,
  GameValueRow,
  UpsetPredictionRow,
} from "@/lib/types";
import { americanToImpliedProbability } from "@/lib/utils/oddsCalculator";
import { getConfidenceTier } from "@/lib/utils/valueRatings";

function buildUpsetReasons(row: GameValueRow) {
  const underdog =
    row.game.moneylineAway > row.game.moneylineHome ? row.awayTeam : row.homeTeam;
  const favorite = underdog.id === row.awayTeam.id ? row.homeTeam : row.awayTeam;
  const reasons: string[] = [];

  if (underdog.metrics.recentForm > favorite.metrics.recentForm + 4) {
    reasons.push("Stronger recent form");
  }

  if (underdog.metrics.rebounding > favorite.metrics.rebounding + 3) {
    reasons.push("Rebounding edge");
  }

  if (underdog.metrics.defense < favorite.metrics.defense - 3) {
    reasons.push("Defensive edge");
  }

  if (favorite.metrics.atsTrends < 50 || favorite.metrics.recentForm < 52) {
    reasons.push("Weak favorite profile");
  }

  if (
    Math.abs(row.modelWinProbability - row.impliedWinProbability) <= 0.08 ||
    Math.abs(row.moneylineEdge) >= 0.035
  ) {
    reasons.push("Close model score despite market gap");
  }

  return reasons.slice(0, 3);
}

function getUpsetSeverity(upsetProbability: number) {
  if (upsetProbability >= 0.42) {
    return "Danger Zone" as const;
  }

  if (upsetProbability >= 0.34) {
    return "Live Dog" as const;
  }

  return "Watch" as const;
}

function getVolatility(row: GameValueRow) {
  const probabilityGap = Math.abs(row.modelWinProbability - 0.5);
  const upsetModifier =
    row.upsetRisk === "High" ? 0.22 : row.upsetRisk === "Medium" ? 0.14 : 0.08;

  return Math.max(0.12, 0.62 - probabilityGap + upsetModifier);
}

export function buildUpsetPredictions(rows: GameValueRow[], limit = 8): UpsetPredictionRow[] {
  return rows
    .map((row) => {
      const awayImplied = row.impliedWinProbability;
      const homeImplied = americanToImpliedProbability(row.game.moneylineHome);
      const awayModel = row.modelWinProbability;
      const homeModel = 1 - awayModel;
      const awayIsFavorite = awayImplied >= homeImplied;
      const favorite = awayIsFavorite ? row.awayTeam : row.homeTeam;
      const underdog = awayIsFavorite ? row.homeTeam : row.awayTeam;
      const upsetProbability = awayIsFavorite ? homeModel : awayModel;
      const volatility = getVolatility(row);

      return {
        id: `${row.game.id}-upset`,
        matchup: row.matchup,
        favorite,
        underdog,
        favoriteWinProbability: awayIsFavorite ? awayModel : homeModel,
        upsetProbability,
        upsetSeverity: getUpsetSeverity(upsetProbability),
        confidenceTier: getConfidenceTier({
          probability: upsetProbability,
          edge: row.moneylineEdge,
          volatility,
        }) as BettingConfidenceTier,
        reasons: buildUpsetReasons(row),
        sourceGame: row,
      } satisfies UpsetPredictionRow;
    })
    .sort((left, right) => {
      if (right.upsetProbability !== left.upsetProbability) {
        return right.upsetProbability - left.upsetProbability;
      }

      return Math.abs(right.sourceGame.moneylineEdge) - Math.abs(left.sourceGame.moneylineEdge);
    })
    .slice(0, limit);
}
