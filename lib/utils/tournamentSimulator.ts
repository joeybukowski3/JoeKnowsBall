import { rankingCategories } from "@/lib/data";
import type {
  BracketGameNode,
  BracketLocksMap,
  RankingCategoryGroup,
  RankingPreset,
  RankingResultRow,
  RankingSettings,
  ResolvedBracketGame,
  ResolvedBracketParticipant,
  Team,
  TournamentSimulationResult,
  UpsetSeverity,
} from "@/lib/types";
import { rankingsEngine } from "@/lib/utils/rankingsEngine";

export type BracketPicksMap = Record<string, string>;

type SimulationTrackerRow = {
  team: Team;
  roundOf32: number;
  sweet16: number;
  elite8: number;
  finalFour: number;
  championshipGame: number;
  champion: number;
};

type SimulationAdvanceKey = keyof Omit<SimulationTrackerRow, "team">;

const roundOrder = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "Championship",
] as const;

const reasonLabels: Record<RankingCategoryGroup, string> = {
  offense: "Stronger offense",
  defense: "Stronger defense",
  shooting: "Cleaner shooting profile",
  rebounding: "Better rebounding control",
  ballControl: "Safer ball control",
  sos: "More schedule-tested",
  recentForm: "Better recent form",
  homeAway: "More travel-proof profile",
  atsTrends: "Better ATS support",
};

function clonePresetSettings(preset: RankingPreset): RankingSettings {
  return {
    presetId: preset.id,
    activeCategories: { ...preset.activeCategories },
    weights: { ...preset.weights },
  };
}

export function getOrderedBracketGames(bracketGames: BracketGameNode[]) {
  return [...bracketGames].sort(
    (left, right) =>
      roundOrder.indexOf(left.round) - roundOrder.indexOf(right.round) ||
      left.order - right.order,
  );
}

export function getBracketWinProbability(scoreA: number | null, scoreB: number | null) {
  if (scoreA === null || scoreB === null) {
    return null;
  }

  return 1 / (1 + Math.exp(-(scoreA - scoreB) / 7.5));
}

export function buildBracketRankingRows(teams: Team[], preset: RankingPreset) {
  return rankingsEngine(teams, clonePresetSettings(preset), rankingCategories);
}

function resolveParticipant(
  source: BracketGameNode["participants"][number],
  teamsById: Map<string, Team>,
  rankingById: Map<string, RankingResultRow>,
  winnersByGame: Map<string, string | null>,
): ResolvedBracketParticipant {
  if (source.type === "team" && source.teamId) {
    const team = teamsById.get(source.teamId) ?? null;
    const ranking = team ? rankingById.get(team.id) : null;

    return {
      team,
      seed: source.seed ?? (team?.seed ? Number(team.seed) : null),
      modelScore: ranking?.overallScore ?? null,
      rank: ranking?.rank ?? null,
      winProbability: null,
    };
  }

  if (source.type === "winner" && source.sourceGameId) {
    const winnerTeamId = winnersByGame.get(source.sourceGameId);
    const team = winnerTeamId ? teamsById.get(winnerTeamId) ?? null : null;
    const ranking = team ? rankingById.get(team.id) : null;

    return {
      team,
      seed: team?.seed ? Number(team.seed) : null,
      modelScore: ranking?.overallScore ?? null,
      rank: ranking?.rank ?? null,
      winProbability: null,
    };
  }

  return {
    team: null,
    seed: null,
    modelScore: null,
    rank: null,
    winProbability: null,
  };
}

export function getUpsetRisk(teamA: ResolvedBracketParticipant, teamB: ResolvedBracketParticipant) {
  if (!teamA.team || !teamB.team || !teamA.rank || !teamB.rank) {
    return "Toss-Up" as const;
  }

  const seedDiff = Math.abs((teamA.seed ?? 0) - (teamB.seed ?? 0));
  const rankDiff = Math.abs(teamA.rank - teamB.rank);
  const modelDiff = Math.abs((teamA.modelScore ?? 0) - (teamB.modelScore ?? 0));

  if (seedDiff >= 6 && rankDiff <= 18 && modelDiff <= 8) {
    return "High" as const;
  }

  if (seedDiff >= 3 && modelDiff <= 14) {
    return "Medium" as const;
  }

  return modelDiff <= 5 ? "Toss-Up" as const : "Low" as const;
}

export function getUpsetSeverity(
  teamA: ResolvedBracketParticipant,
  teamB: ResolvedBracketParticipant,
  winnerTeamId: string | null,
): UpsetSeverity {
  if (!winnerTeamId || !teamA.team || !teamB.team) {
    return "None";
  }

  const winner = teamA.team.id === winnerTeamId ? teamA : teamB;
  const loser = teamA.team.id === winnerTeamId ? teamB : teamA;
  const winnerSeed = winner.seed ?? 0;
  const loserSeed = loser.seed ?? 0;

  if (!winnerSeed || !loserSeed || winnerSeed <= loserSeed) {
    return "None";
  }

  const seedGap = winnerSeed - loserSeed;
  const modelGap = Math.abs((winner.modelScore ?? 0) - (loser.modelScore ?? 0));

  if (seedGap >= 8 || (seedGap >= 6 && modelGap <= 4.5)) {
    return "Major Upset";
  }

  if (seedGap >= 5 || (seedGap >= 4 && modelGap <= 7)) {
    return "Strong Upset";
  }

  return "Mild Upset";
}

export function buildPickReason(
  teamA: ResolvedBracketParticipant,
  teamB: ResolvedBracketParticipant,
  winnerTeamId: string | null,
  preset?: RankingPreset,
) {
  if (!winnerTeamId || !teamA.team || !teamB.team) {
    return null;
  }

  const winner = teamA.team.id === winnerTeamId ? teamA.team : teamB.team;
  const loser = teamA.team.id === winnerTeamId ? teamB.team : teamA.team;
  const winnerSeed = teamA.team.id === winnerTeamId ? teamA.seed : teamB.seed;
  const loserSeed = teamA.team.id === winnerTeamId ? teamB.seed : teamA.seed;
  const overallGap = Math.abs((teamA.modelScore ?? 0) - (teamB.modelScore ?? 0));

  if (
    preset?.id === "upset-finder" &&
    winnerSeed !== null &&
    loserSeed !== null &&
    winnerSeed !== undefined &&
    loserSeed !== undefined &&
    winnerSeed > loserSeed
  ) {
    return {
      label: "Value-driven upset pick",
      detail: `${winner.shortName} grades well on recent form and market-facing signals despite the seed gap.`,
    };
  }

  if (overallGap >= 8) {
    return {
      label: "Stronger overall model score",
      detail: `${winner.shortName} owns the clearest full-profile edge in the active ${preset?.name ?? "model"}.`,
    };
  }

  let bestCategory: RankingCategoryGroup = "offense";
  let bestAdvantage = Number.NEGATIVE_INFINITY;

  for (const category of rankingCategories) {
    if (preset && !preset.activeCategories[category.key]) {
      continue;
    }

    const winnerValue = winner.metrics[category.key];
    const loserValue = loser.metrics[category.key];
    const rawDifference =
      category.direction === "lower" ? loserValue - winnerValue : winnerValue - loserValue;
    const weightedDifference = rawDifference * (preset?.weights[category.key] ?? 1);

    if (weightedDifference > bestAdvantage) {
      bestAdvantage = weightedDifference;
      bestCategory = category.key;
    }
  }

  return {
    label: reasonLabels[bestCategory],
    detail: `${winner.shortName} separates most clearly in ${reasonLabels[bestCategory].toLowerCase()} under the current weighting.`,
  };
}

export function resolveBracket(
  bracketGames: BracketGameNode[],
  teams: Team[],
  rankingRows: RankingResultRow[],
  picks: BracketPicksMap,
  lockedGames: BracketLocksMap = {},
  preset?: RankingPreset,
) {
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const rankingById = new Map(rankingRows.map((row) => [row.team.id, row]));
  const winnersByGame = new Map<string, string | null>();
  const resolvedGames: ResolvedBracketGame[] = [];

  for (const game of getOrderedBracketGames(bracketGames)) {
    const teamA = resolveParticipant(game.participants[0], teamsById, rankingById, winnersByGame);
    const teamB = resolveParticipant(game.participants[1], teamsById, rankingById, winnersByGame);
    const probabilityA = getBracketWinProbability(teamA.modelScore, teamB.modelScore);
    const probabilityB = probabilityA !== null ? 1 - probabilityA : null;
    teamA.winProbability = probabilityA;
    teamB.winProbability = probabilityB;

    const candidateWinner = picks[game.id];
    const validWinner =
      candidateWinner && [teamA.team?.id, teamB.team?.id].includes(candidateWinner)
        ? candidateWinner
        : null;

    winnersByGame.set(game.id, validWinner);

    resolvedGames.push({
      id: game.id,
      region: game.region,
      round: game.round,
      order: game.order,
      nextGameId: game.nextGameId,
      nextSlot: game.nextSlot,
      teamA,
      teamB,
      winnerTeamId: validWinner,
      isLocked: Boolean(lockedGames[game.id] && validWinner),
      upsetRisk: getUpsetRisk(teamA, teamB),
      upsetSeverity: getUpsetSeverity(teamA, teamB, validWinner),
      pickReason: buildPickReason(teamA, teamB, validWinner, preset),
    });
  }

  return resolvedGames;
}

export function autoFillBracket(
  bracketGames: BracketGameNode[],
  teams: Team[],
  rankingRows: RankingResultRow[],
) {
  const picks: BracketPicksMap = {};

  for (const game of getOrderedBracketGames(bracketGames)) {
    const resolved = resolveBracket(bracketGames, teams, rankingRows, picks);
    const current = resolved.find((resolvedGame) => resolvedGame.id === game.id);

    if (!current?.teamA.team || !current.teamB.team) {
      continue;
    }

    picks[game.id] =
      (current.teamA.modelScore ?? 0) >= (current.teamB.modelScore ?? 0)
        ? current.teamA.team.id
        : current.teamB.team.id;
  }

  return picks;
}

function createSimulationSeed(teams: Team[]) {
  return new Map(
    teams.map((team) => [
      team.id,
      {
        team,
        roundOf32: 0,
        sweet16: 0,
        elite8: 0,
        finalFour: 0,
        championshipGame: 0,
        champion: 0,
      } satisfies SimulationTrackerRow,
    ]),
  );
}

function markAdvance(tracker: ReturnType<typeof createSimulationSeed>, teamId: string, round: SimulationAdvanceKey) {
  const row = tracker.get(teamId);
  if (!row) {
    return;
  }

  row[round] += 1;
}

export function tournamentSimulator({
  teams,
  bracketGames,
  preset,
  iterations,
  lockedPicks = {},
}: {
  teams: Team[];
  bracketGames: BracketGameNode[];
  preset: RankingPreset;
  iterations: number;
  lockedPicks?: BracketPicksMap;
}): TournamentSimulationResult {
  const rankingRows = buildBracketRankingRows(teams, preset);
  const tracker = createSimulationSeed(teams);
  const rankingById = new Map(rankingRows.map((row) => [row.team.id, row]));

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const picks: BracketPicksMap = { ...lockedPicks };

    for (const game of getOrderedBracketGames(bracketGames)) {
      const resolved = resolveBracket(bracketGames, teams, rankingRows, picks);
      const current = resolved.find((resolvedGame) => resolvedGame.id === game.id);

      if (!current?.teamA.team || !current.teamB.team || picks[game.id]) {
        continue;
      }

      const probabilityA =
        getBracketWinProbability(current.teamA.modelScore, current.teamB.modelScore) ?? 0.5;
      picks[game.id] = Math.random() <= probabilityA ? current.teamA.team.id : current.teamB.team.id;
    }

    const finalBracket = resolveBracket(bracketGames, teams, rankingRows, picks);

    for (const game of finalBracket) {
      const winnerId = game.winnerTeamId;
      if (!winnerId) {
        continue;
      }

      switch (game.round) {
        case "Round of 64":
          markAdvance(tracker, winnerId, "roundOf32");
          break;
        case "Round of 32":
          markAdvance(tracker, winnerId, "sweet16");
          break;
        case "Sweet 16":
          markAdvance(tracker, winnerId, "elite8");
          break;
        case "Elite 8":
          markAdvance(tracker, winnerId, "finalFour");
          break;
        case "Final Four":
          markAdvance(tracker, winnerId, "championshipGame");
          break;
        case "Championship":
          markAdvance(tracker, winnerId, "champion");
          break;
      }
    }
  }

  const rows = Array.from(tracker.values())
    .map((row) => ({
      team: row.team,
      roundOf32: row.roundOf32 / iterations,
      sweet16: row.sweet16 / iterations,
      elite8: row.elite8 / iterations,
      finalFour: row.finalFour / iterations,
      championshipGame: row.championshipGame / iterations,
      champion: row.champion / iterations,
    }))
    .sort((left, right) => {
      if (right.champion !== left.champion) {
        return right.champion - left.champion;
      }

      return (
        (rankingById.get(right.team.id)?.overallScore ?? 0) -
        (rankingById.get(left.team.id)?.overallScore ?? 0)
      );
    });

  return {
    iterations,
    champion: rows[0]?.team ?? null,
    rows,
  };
}
