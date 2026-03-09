"use client";

import { useState } from "react";
import { BracketBoard } from "@/components/bracket/BracketBoard";
import { BracketControls } from "@/components/bracket/BracketControls";
import { PathDifficultyPanel } from "@/components/bracket/PathDifficultyPanel";
import { TournamentSimulationPanel } from "@/components/bracket/TournamentSimulationPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { TeamChip } from "@/components/shared/TeamChip";
import type {
  BracketGameNode,
  BracketMode,
  BracketRound,
  RankingPreset,
  ResolvedBracketGame,
  Team,
  TournamentSimulationResult,
} from "@/lib/types";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import {
  autoFillBracket,
  buildBracketRankingRows,
  resolveBracket,
  tournamentSimulator,
  type BracketPicksMap,
} from "@/lib/utils/tournamentSimulator";

type BracketBuilderDashboardProps = {
  teams: Team[];
  bracketGames: BracketGameNode[];
  presets: RankingPreset[];
};

const roundOrder: BracketRound[] = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "Championship",
];

export function BracketBuilderDashboard({
  teams,
  bracketGames,
  presets,
}: BracketBuilderDashboardProps) {
  const [mode, setMode] = useState<BracketMode>("manual");
  const [presetId, setPresetId] = useState(presets[0].id);
  const [picks, setPicks] = useState<BracketPicksMap>({});
  const [iterationCount, setIterationCount] = useState(5000);
  const [simulationResult, setSimulationResult] =
    useState<TournamentSimulationResult | null>(null);

  const selectedPreset =
    presets.find((preset) => preset.id === presetId) ?? presets[0];
  const rankingRows = buildBracketRankingRows(teams, selectedPreset);
  const resolvedGames = resolveBracket(bracketGames, teams, rankingRows, picks);
  const rounds = Object.fromEntries(
    roundOrder.map((round) => [
      round,
      resolvedGames.filter((game) => game.round === round),
    ]),
  ) as Record<BracketRound, ResolvedBracketGame[]>;
  const paths = pathDifficulty(teams, bracketGames, rankingRows);
  const championGame = resolvedGames.find((game) => game.id === "championship-1");
  const upsetHotspots = resolvedGames.filter(
    (game) => game.upsetRisk === "High" || game.upsetRisk === "Medium",
  );
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

  function handleRunSimulation() {
    setSimulationResult(
      tournamentSimulator({
        teams,
        bracketGames,
        preset: selectedPreset,
        iterations: iterationCount,
        lockedPicks: picks,
      }),
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bracket Builder"
        title="Interactive tournament bracket"
        description="Build the field manually or auto-advance teams using the active ranking preset, then compare path difficulty and simulation output against the current board."
      />

      <BracketControls
        mode={mode}
        presetId={selectedPreset.id}
        presets={presets}
        onModeChange={handleModeChange}
        onPresetChange={setPresetId}
        onAutoFill={handleAutoFill}
        onReset={handleReset}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.72fr)_380px]">
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

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <TournamentSimulationPanel
          iterationCount={iterationCount}
          onIterationChange={setIterationCount}
          onRun={handleRunSimulation}
          result={simulationResult}
          upsetHotspots={upsetHotspots}
        />
        <Panel
          eyebrow="Tournament Outlook"
          title="Path difficulty analysis"
          description="Current field difficulty and model context under the active preset."
        >
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-slate-950/75">
                <tr className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3 text-right">Base</th>
                  <th className="px-4 py-3 text-right">Path</th>
                  <th className="px-4 py-3 text-right">Adjusted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8 bg-white/[0.03]">
                {paths.slice(0, 16).map((row) => (
                  <tr key={row.team.id} className="transition hover:bg-white/[0.04]">
                    <td className="px-4 py-3">
                      <TeamChip
                        name={row.team.name}
                        shortName={row.team.shortName}
                        compact
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-200">
                      {row.baseModelScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-300">
                      {row.pathDifficulty.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-sky-200">
                      {row.adjustedTournamentScore.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
