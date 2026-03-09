import type {
  RankingCategoryConfig,
  RankingCategoryGroup,
  RankingResultRow,
  RankingSettings,
  Team,
} from "@/lib/types";
import { normalizeStat } from "@/lib/utils/normalizeStat";

function getRangeByCategory(teams: Team[], category: RankingCategoryGroup) {
  const values = teams.map((team) => team.metrics[category]);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function getValueLabel(valueScore: number): RankingResultRow["valueLabel"] {
  if (valueScore >= 70) {
    return "Strong";
  }

  if (valueScore >= 52) {
    return "Watch";
  }

  return "Neutral";
}

export function rankingsEngine(
  teams: Team[],
  settings: RankingSettings,
  categories: RankingCategoryConfig[],
) {
  const ranges = Object.fromEntries(
    categories.map((category) => [category.key, getRangeByCategory(teams, category.key)]),
  ) as Record<RankingCategoryGroup, { min: number; max: number }>;

  const weightedRows: RankingResultRow[] = teams.map((team) => {
    let weightedTotal = 0;
    let activeWeightTotal = 0;

    const categoryScores = Object.fromEntries(
      categories.map((category) => {
        const raw = team.metrics[category.key];
        const normalized = normalizeStat(raw, ranges[category.key].min, ranges[category.key].max, {
          inverse: category.direction === "lower",
        });
        const active = settings.activeCategories[category.key];
        const weight = active ? settings.weights[category.key] : 0;

        if (active && weight > 0) {
          weightedTotal += normalized * weight;
          activeWeightTotal += weight;
        }

        return [
          category.key,
          {
            raw,
            normalized,
            active,
            weight,
          },
        ];
      }),
    ) as RankingResultRow["categoryScores"];

    const overallScore = activeWeightTotal > 0 ? weightedTotal / activeWeightTotal : 0;
    const valueScore =
      categoryScores.atsTrends.normalized * 0.45 +
      categoryScores.recentForm.normalized * 0.35 +
      categoryScores.sos.normalized * 0.2;

    return {
      rank: 0,
      team,
      overallScore,
      valueScore,
      valueLabel: getValueLabel(valueScore),
      categoryScores,
    };
  });

  return weightedRows
    .sort((left, right) => right.overallScore - left.overallScore)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
}
