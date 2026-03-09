import type {
  BracketGameNode,
  PathDifficultyRound,
  PathDifficultyRow,
  RankingResultRow,
  Team,
} from "@/lib/types";

function collectTeamsFromSource(
  source: BracketGameNode["participants"][number],
  gameMap: Map<string, BracketGameNode>,
): string[] {
  if (source.type === "team" && source.teamId) {
    return [source.teamId];
  }

  if (source.type === "winner" && source.sourceGameId) {
    const game = gameMap.get(source.sourceGameId);

    if (!game) {
      return [];
    }

    return game.participants.flatMap((participant) =>
      collectTeamsFromSource(participant, gameMap),
    );
  }

  return [];
}

export function pathDifficulty(
  teams: Team[],
  bracketGames: BracketGameNode[],
  rankingRows: RankingResultRow[],
) {
  const gameMap = new Map(bracketGames.map((game) => [game.id, game]));
  const rankingMap = new Map(rankingRows.map((row) => [row.team.id, row]));

  return teams
    .map((team) => {
      const startingGame = bracketGames.find((game) =>
        game.participants.some(
          (participant) =>
            participant.type === "team" && participant.teamId === team.id,
        ),
      );

      const baseModelScore = rankingMap.get(team.id)?.overallScore ?? 0;

      if (!startingGame) {
        return {
          team,
          baseModelScore,
          pathDifficulty: 0,
          adjustedTournamentScore: baseModelScore,
          rounds: [] as PathDifficultyRound[],
        };
      }

      let currentGame: BracketGameNode | undefined = startingGame;
      const rounds: PathDifficultyRound[] = [];

      while (currentGame?.nextGameId) {
        const nextGame = gameMap.get(currentGame.nextGameId);

        if (!nextGame) {
          break;
        }

        const opposingSource =
          currentGame.nextSlot === "teamA"
            ? nextGame.participants[1]
            : nextGame.participants[0];
        const possibleOpponents = collectTeamsFromSource(opposingSource, gameMap);
        const opponentStrengths = possibleOpponents
          .map((teamId) => rankingMap.get(teamId)?.overallScore ?? 0)
          .filter((score) => score > 0);
        const expectedOpponentStrength =
          opponentStrengths.length > 0
            ? opponentStrengths.reduce((sum, value) => sum + value, 0) /
              opponentStrengths.length
            : 0;

        rounds.push({
          round: nextGame.round,
          expectedOpponentStrength: Number(expectedOpponentStrength.toFixed(1)),
        });

        currentGame = nextGame;
      }

      const pathDifficultyScore = rounds.reduce(
        (sum, round, index) => sum + round.expectedOpponentStrength * (index + 1),
        0,
      );
      const pathDifficulty = Number(
        (pathDifficultyScore / Math.max(rounds.length, 1)).toFixed(1),
      );

      return {
        team,
        baseModelScore: Number(baseModelScore.toFixed(1)),
        pathDifficulty,
        adjustedTournamentScore: Number((baseModelScore - pathDifficulty * 0.18).toFixed(1)),
        rounds,
      } satisfies PathDifficultyRow;
    })
    .sort((left, right) => right.adjustedTournamentScore - left.adjustedTournamentScore);
}
