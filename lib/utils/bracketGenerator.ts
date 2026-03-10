import { activeTournamentField } from "@/lib/data/tournamentField";
import type {
  BracketAutoFillMode,
  BracketGameNode,
  BracketLocksMap,
  BracketSummaryData,
  PathDifficultyRow,
  RankingPreset,
  Team,
  TournamentRegion,
  UpsetSeverity,
} from "@/lib/types";
import {
  buildBracketRankingRows,
  getOrderedBracketGames,
  resolveBracket,
  type BracketPicksMap,
} from "@/lib/utils/tournamentSimulator";

function pickHigherModelTeam(teamAId: string, teamBId: string, scoreA: number | null, scoreB: number | null) {
  return (scoreA ?? 0) >= (scoreB ?? 0) ? teamAId : teamBId;
}

export function generateBracketPicks({
  bracketGames,
  teams,
  preset,
  existingPicks = {},
  lockedGames = {},
  fillMode = "all",
}: {
  bracketGames: BracketGameNode[];
  teams: Team[];
  preset: RankingPreset;
  existingPicks?: BracketPicksMap;
  lockedGames?: BracketLocksMap;
  fillMode?: BracketAutoFillMode;
}) {
  const rankingRows = buildBracketRankingRows(teams, preset);
  const picks: BracketPicksMap = fillMode === "remaining" ? { ...existingPicks } : {};

  for (const game of getOrderedBracketGames(bracketGames)) {
    const resolved = resolveBracket(bracketGames, teams, rankingRows, picks, lockedGames, preset);
    const current = resolved.find((resolvedGame) => resolvedGame.id === game.id);
    const lockedWinner = existingPicks[game.id];

    if (!current?.teamA.team || !current.teamB.team) {
      continue;
    }

    if (lockedGames[game.id] && lockedWinner) {
      picks[game.id] = lockedWinner;
      continue;
    }

    if (fillMode === "remaining" && picks[game.id]) {
      continue;
    }

    picks[game.id] = pickHigherModelTeam(
      current.teamA.team.id,
      current.teamB.team.id,
      current.teamA.modelScore,
      current.teamB.modelScore,
    );
  }

  return {
    picks,
    rankingRows,
    resolvedGames: resolveBracket(bracketGames, teams, rankingRows, picks, lockedGames, preset),
  };
}

function severityWeight(severity: UpsetSeverity) {
  switch (severity) {
    case "Major Upset":
      return 3;
    case "Strong Upset":
      return 2;
    case "Mild Upset":
      return 1;
    default:
      return 0;
  }
}

function buildRegionScores(paths: PathDifficultyRow[]) {
  const scoreMap = new Map<TournamentRegion, number[]>();

  for (const path of paths) {
    const fieldEntry = activeTournamentField.find((entry) => entry.teamId === path.team.id);
    if (!fieldEntry) {
      continue;
    }

    const current = scoreMap.get(fieldEntry.region) ?? [];
    current.push(path.adjustedTournamentScore);
    scoreMap.set(fieldEntry.region, current);
  }

  return Array.from(scoreMap.entries())
    .map(([region, scores]) => ({
      region,
      score: scores.reduce((sum, value) => sum + value, 0) / Math.max(scores.length, 1),
    }))
    .sort((left, right) => right.score - left.score);
}

export function buildBracketSummary({
  preset,
  resolvedGames,
  paths,
}: {
  preset: RankingPreset;
  resolvedGames: ReturnType<typeof resolveBracket>;
  paths: PathDifficultyRow[];
}): BracketSummaryData {
  const championship = resolvedGames.find((game) => game.round === "Championship");
  const finalFourGames = resolvedGames.filter((game) => game.round === "Final Four");
  const upsets = resolvedGames.filter((game) => game.upsetSeverity !== "None" && game.winnerTeamId);
  const biggestUpsetGame =
    [...upsets].sort((left, right) => {
      const severityGap = severityWeight(right.upsetSeverity) - severityWeight(left.upsetSeverity);
      if (severityGap !== 0) {
        return severityGap;
      }

      const leftGap = Math.abs((left.teamA.seed ?? 0) - (left.teamB.seed ?? 0));
      const rightGap = Math.abs((right.teamA.seed ?? 0) - (right.teamB.seed ?? 0));
      return rightGap - leftGap;
    })[0] ?? null;
  const regionScores = buildRegionScores(paths);
  const champion =
    championship?.winnerTeamId
      ? [championship.teamA.team, championship.teamB.team].find(
          (team) => team?.id === championship.winnerTeamId,
        ) ?? null
      : null;
  const runnerUp =
    championship?.winnerTeamId
      ? [championship.teamA.team, championship.teamB.team].find(
          (team) => team && team.id !== championship.winnerTeamId,
        ) ?? null
      : null;
  const finalFour = finalFourGames
    .map((game) =>
      game.winnerTeamId
        ? [game.teamA.team, game.teamB.team].find((team) => team?.id === game.winnerTeamId) ?? null
        : null,
    )
    .filter((team): team is Team => team !== null);

  return {
    selectedPreset: preset.name,
    champion,
    runnerUp,
    finalFour,
    upsetCount: upsets.length,
    biggestUpset: biggestUpsetGame
      ? {
          gameId: biggestUpsetGame.id,
          label: `${biggestUpsetGame.teamA.team?.shortName ?? "TBD"} vs ${biggestUpsetGame.teamB.team?.shortName ?? "TBD"}`,
          severity: biggestUpsetGame.upsetSeverity,
        }
      : null,
    strongestRegion: regionScores[0]
      ? { region: regionScores[0].region, score: Number(regionScores[0].score.toFixed(1)) }
      : null,
    weakestRegion:
      regionScores.at(-1)
        ? {
            region: regionScores.at(-1)!.region,
            score: Number(regionScores.at(-1)!.score.toFixed(1)),
          }
        : null,
  };
}
