import type {
  BracketGameNode,
  BracketLocksMap,
  BracketPresetComparisonRow,
  RankingPreset,
  Team,
} from "@/lib/types";
import { buildBracketSummary, generateBracketPicks } from "@/lib/utils/bracketGenerator";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import type { BracketPicksMap } from "@/lib/utils/tournamentSimulator";

export function buildPresetComparisons({
  teams,
  bracketGames,
  presets,
  lockedGames = {},
  lockedPicks = {},
  selectedPresetId,
}: {
  teams: Team[];
  bracketGames: BracketGameNode[];
  presets: RankingPreset[];
  lockedGames?: BracketLocksMap;
  lockedPicks?: BracketPicksMap;
  selectedPresetId: string;
}): BracketPresetComparisonRow[] {
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId) ?? presets[0];
  const baseline = generateBracketPicks({
    teams,
    bracketGames,
    preset: selectedPreset,
    existingPicks: lockedPicks,
    lockedGames,
    fillMode: "all",
  });
  const baselineSummary = buildBracketSummary({
    preset: selectedPreset,
    resolvedGames: baseline.resolvedGames,
    paths: pathDifficulty(teams, bracketGames, baseline.rankingRows),
  });

  return presets.map((preset) => {
    const generated = generateBracketPicks({
      teams,
      bracketGames,
      preset,
      existingPicks: lockedPicks,
      lockedGames,
      fillMode: "all",
    });
    const summary = buildBracketSummary({
      preset,
      resolvedGames: generated.resolvedGames,
      paths: pathDifficulty(teams, bracketGames, generated.rankingRows),
    });

    return {
      presetId: preset.id,
      presetName: preset.name,
      champion: summary.champion,
      runnerUp: summary.runnerUp,
      finalFour: summary.finalFour,
      upsetCount: summary.upsetCount,
      biggestUpset: summary.biggestUpset?.severity ?? null,
      differentChampion:
        Boolean(summary.champion?.id) && summary.champion?.id !== baselineSummary.champion?.id,
    };
  });
}
