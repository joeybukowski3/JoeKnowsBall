"use client";

import { useState } from "react";
import { BracketBoard } from "@/components/bracket/BracketBoard";
import { BracketControls } from "@/components/bracket/BracketControls";
import { PathDifficultyPanel } from "@/components/bracket/PathDifficultyPanel";
import { Panel } from "@/components/shared/Panel";
import { rankingCategories } from "@/lib/data";
import type {
  BracketGameNode,
  BracketMode,
  BracketRound,
  RankingPreset,
  RankingResultRow,
  RankingSettings,
  ResolvedBracketGame,
  ResolvedBracketParticipant,
  Team,
} from "@/lib/types";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import { rankingsEngine } from "@/lib/utils/rankingsEngine";

type BracketBuilderDashboardProps = {
  teams: Team[];
  bracketGames: BracketGameNode[];
  presets: RankingPreset[];
};

type PicksMap = Record<string, string>;

const roundOrder: BracketRound[] = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "Championship",
];

function clonePresetSettings(preset: RankingPreset): RankingSettings {
  return {
    presetId: preset.id,
    activeCategories: { ...preset.activeCategories },
    weights: { ...preset.weights },
  };
}

function getWinProbability(scoreA: number | null, scoreB: number | null) {
  if (scoreA === null || scoreB === null) {
    return null;
  }

  return 1 / (1 + Math.exp(-(scoreA - scoreB) / 7.5));
}

function getUpsetRisk(
  teamA: ResolvedBracketParticipant,
  teamB: ResolvedBracketParticipant,
) {
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

function resolveBracket(
  bracketGames: BracketGameNode[],
  teams: Team[],
  rankingRows: RankingResultRow[],
  picks: PicksMap,
) {
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const rankingById = new Map(rankingRows.map((row) => [row.team.id, row]));
  const winnersByGame = new Map<string, string | null>();
  const resolvedGames: ResolvedBracketGame[] = [];

  const orderedGames = [...bracketGames].sort(
    (left, right) =>
      roundOrder.indexOf(left.round) - roundOrder.indexOf(right.round) ||
      left.order - right.order,
  );

  for (const game of orderedGames) {
    const teamA = resolveParticipant(
      game.participants[0],
      teamsById,
      rankingById,
      winnersByGame,
    );
    const teamB = resolveParticipant(
      game.participants[1],
      teamsById,
      rankingById,
      winnersByGame,
    );
    const probabilityA = getWinProbability(teamA.modelScore, teamB.modelScore);
    const probabilityB = probabilityA !== null ? 1 - probabilityA : null;
    teamA.winProbability = probabilityA;
    teamB.winProbability = probabilityB;

    const candidateWinner = picks[game.id];
    const validWinner =
      candidateWinner &&
      [teamA.team?.id, teamB.team?.id].includes(candidateWinner)
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
      upsetRisk: getUpsetRisk(teamA, teamB),
    });
  }

  return resolvedGames;
}

function autoFillBracket(
  bracketGames: BracketGameNode[],
  teams: Team[],
  rankingRows: RankingResultRow[],
) {
  const picks: PicksMap = {};
  const resolved = resolveBracket(bracketGames, teams, rankingRows, picks);

  for (const game of resolved) {
    if (!game.teamA.team || !game.teamB.team) {
      continue;
    }

    picks[game.id] =
      (game.teamA.modelScore ?? 0) >= (game.teamB.modelScore ?? 0)
        ? game.teamA.team.id
        : game.teamB.team.id;
  }

  return picks;
}

export function BracketBuilderDashboard({
  teams,
  bracketGames,
  presets,
}: BracketBuilderDashboardProps) {
  const [mode, setMode] = useState<BracketMode>("manual");
  const [presetId, setPresetId] = useState(presets[0].id);
  const [picks, setPicks] = useState<PicksMap>({});

  const selectedPreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
  const settings = clonePresetSettings(selectedPreset);
  const rankingRows = rankingsEngine(teams, settings, rankingCategories);
  const resolvedGames = resolveBracket(bracketGames, teams, rankingRows, picks);
  const rounds = Object.fromEntries(
    roundOrder.map((round) => [
      round,
      resolvedGames.filter((game) => game.round === round),
    ]),
  ) as Record<BracketRound, ResolvedBracketGame[]>;
  const paths = pathDifficulty(teams, bracketGames, rankingRows);
  const championGame = resolvedGames.find((game) => game.id === "championship-1");
  const champion =
    championGame?.winnerTeamId
      ? teams.find((team) => team.id === championGame.winnerTeamId) ?? null
      : paths[0]?.team ?? null;

  function handlePick(gameId: string, teamId: string) {
    if (mode !== "manual") {
      return;
    }

    setPicks((current) => ({
      ...current,
      [gameId]: teamId,
    }));
  }

  function handleAutoFill() {
    setPicks(autoFillBracket(bracketGames, teams, rankingRows));
    setMode("auto");
  }

  function handleReset() {
    setPicks({});
    setMode("manual");
  }

  function handleModeChange(nextMode: BracketMode) {
    setMode(nextMode);

    if (nextMode === "auto") {
      setPicks(autoFillBracket(bracketGames, teams, rankingRows));
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
          Bracket Builder
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Interactive tournament bracket
        </h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Build the field manually or auto-advance teams using the active ranking
          preset, with path difficulty and upset risk analysis on the side.
        </p>
      </section>

      <BracketControls
        mode={mode}
        presetId={selectedPreset.id}
        presets={presets}
        onModeChange={handleModeChange}
        onPresetChange={setPresetId}
        onAutoFill={handleAutoFill}
        onReset={handleReset}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_360px]">
        <Panel
          eyebrow="Bracket View"
          title="Tournament board"
          description="Click winners in manual mode or auto-fill the full bracket from the active preset."
        >
          <BracketBoard rounds={rounds} mode={mode} onPick={handlePick} />
        </Panel>

        <PathDifficultyPanel
          paths={paths}
          champion={champion}
          resolvedGames={resolvedGames}
        />
      </div>
    </div>
  );
}
