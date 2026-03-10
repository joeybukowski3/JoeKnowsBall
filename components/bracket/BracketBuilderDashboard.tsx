"use client";

import { useMemo, useState } from "react";
import { BracketBoard } from "@/components/bracket/BracketBoard";
import { BracketComparisonPanel } from "@/components/bracket/BracketComparisonPanel";
import { BracketGeneratorControls } from "@/components/bracket/BracketGeneratorControls";
import { BracketSummaryPanel } from "@/components/bracket/BracketSummaryPanel";
import { PathDifficultyPanel } from "@/components/bracket/PathDifficultyPanel";
import { TournamentSimulationPanel } from "@/components/bracket/TournamentSimulationPanel";
import { ChampionProbabilities } from "@/components/insights/ChampionProbabilities";
import { EasiestPaths } from "@/components/insights/EasiestPaths";
import { HardestPaths } from "@/components/insights/HardestPaths";
import { InsightCard } from "@/components/insights/InsightCard";
import { InsightSection } from "@/components/insights/InsightSection";
import { UpsetWatch } from "@/components/insights/UpsetWatch";
import { Badge } from "@/components/shared/Badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { TeamChip } from "@/components/shared/TeamChip";
import { activeTournamentField } from "@/lib/data/tournamentField";
import type {
  BracketGameNode,
  BracketLocksMap,
  BracketMode,
  BracketRound,
  RankingPreset,
  ResolvedBracketGame,
  Team,
  TournamentSimulationResult,
} from "@/lib/types";
import { buildPresetComparisons } from "@/lib/utils/bracketComparison";
import { buildBracketSummary, generateBracketPicks } from "@/lib/utils/bracketGenerator";
import {
  buildBracketUpsetWatch,
  buildChampionProbabilities,
  buildEasiestPaths,
  buildFinalFourProbabilities,
  buildHardestPaths,
} from "@/lib/utils/insightBuilders";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import {
  buildTournamentSummary,
  logTournamentFieldWarnings,
  validateTournamentField,
} from "@/lib/utils/tournamentFieldManager";
import {
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
  const [lockedGames, setLockedGames] = useState<BracketLocksMap>({});
  const [iterationCount, setIterationCount] = useState(5000);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [simulationResult, setSimulationResult] = useState<TournamentSimulationResult | null>(null);

  const selectedPreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
  const rankingRows = useMemo(
    () => buildBracketRankingRows(teams, selectedPreset),
    [selectedPreset, teams],
  );
  const resolvedGames = useMemo(
    () => resolveBracket(bracketGames, teams, rankingRows, picks, lockedGames, selectedPreset),
    [bracketGames, lockedGames, picks, rankingRows, selectedPreset, teams],
  );
  const rounds = useMemo(
    () =>
      Object.fromEntries(
        roundOrder.map((round) => [round, resolvedGames.filter((game) => game.round === round)]),
      ) as Record<BracketRound, ResolvedBracketGame[]>,
    [resolvedGames],
  );
  const paths = useMemo(
    () => pathDifficulty(teams, bracketGames, rankingRows),
    [bracketGames, rankingRows, teams],
  );
  const fieldValidation = validateTournamentField(activeTournamentField);
  const tournamentSummary = buildTournamentSummary(activeTournamentField, teams);
  logTournamentFieldWarnings(fieldValidation);

  const upsetHotspots = resolvedGames.filter(
    (game) => game.upsetRisk === "High" || game.upsetRisk === "Medium" || game.upsetSeverity !== "None",
  );
  const baselineSimulation = useMemo(
    () =>
      tournamentSimulator({
        teams,
        bracketGames,
        preset: selectedPreset,
        iterations: 2000,
        lockedPicks: picks,
      }),
    [bracketGames, picks, selectedPreset, teams],
  );
  const displaySimulation = simulationResult ?? baselineSimulation;
  const easiestPaths = buildEasiestPaths(paths, 5);
  const hardestPaths = buildHardestPaths(paths, 5);
  const championProbabilities = buildChampionProbabilities(displaySimulation, 5);
  const finalFourProbabilities = buildFinalFourProbabilities(displaySimulation, 4);
  const bracketUpsets = buildBracketUpsetWatch(upsetHotspots, 5);
  const summary = useMemo(
    () => buildBracketSummary({ preset: selectedPreset, resolvedGames, paths }),
    [paths, resolvedGames, selectedPreset],
  );
  const comparisonRows = useMemo(
    () =>
      buildPresetComparisons({
        teams,
        bracketGames,
        presets,
        lockedGames,
        lockedPicks: picks,
        selectedPresetId: selectedPreset.id,
      }),
    [bracketGames, lockedGames, picks, presets, selectedPreset.id, teams],
  );

  function handlePick(gameId: string, teamId: string) {
    if (lockedGames[gameId]) {
      return;
    }

    setPicks((current) => ({
      ...current,
      [gameId]: teamId,
    }));
  }

  function handleAutoFill(fillMode: "all" | "remaining") {
    const generated = generateBracketPicks({
      bracketGames,
      teams,
      preset: selectedPreset,
      existingPicks: picks,
      lockedGames,
      fillMode,
    });
    setPicks(generated.picks);
    setMode("auto");
  }

  function handleReset() {
    setPicks({});
    setLockedGames({});
    setSimulationResult(null);
    setMode("manual");
  }

  function handleModeChange(nextMode: BracketMode) {
    setMode(nextMode);

    if (nextMode === "auto") {
      handleAutoFill("all");
    }
  }

  function handleToggleLock(gameId: string) {
    const game = resolvedGames.find((entry) => entry.id === gameId);
    if (!game?.winnerTeamId) {
      return;
    }

    setLockedGames((current) => ({
      ...current,
      [gameId]: !current[gameId],
    }));
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
        title="Interactive tournament bracket generator"
        description="Auto-build the field from any preset, lock key picks, compare how each model sees the bracket, and keep the simulation stack tied to the current board state."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone={fieldValidation.isValid ? "emerald" : "amber"}>
            {fieldValidation.isValid ? "Field Validated" : "Field Needs Review"}
          </Badge>
          <Badge tone="sky">{Object.values(lockedGames).filter(Boolean).length} locked picks</Badge>
        </div>
      </PageHeader>

      <BracketGeneratorControls
        mode={mode}
        presetId={selectedPreset.id}
        presets={presets}
        comparisonEnabled={comparisonEnabled}
        lockedCount={Object.values(lockedGames).filter(Boolean).length}
        onModeChange={handleModeChange}
        onPresetChange={setPresetId}
        onToggleComparison={() => setComparisonEnabled((current) => !current)}
        onAutoFillAll={() => handleAutoFill("all")}
        onAutoFillRemaining={() => handleAutoFill("remaining")}
        onReset={handleReset}
      />

      {comparisonEnabled ? <BracketComparisonPanel rows={comparisonRows} /> : null}

      <InsightSection
        eyebrow="Bracket Insights"
        title="Tournament outlook at a glance"
        description="Simulation and path-difficulty summaries that update with the current preset and board state."
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InsightCard
              eyebrow="Champion"
              title={displaySimulation.champion?.name ?? "Run a simulation"}
              value={
                championProbabilities[0]
                  ? `${(championProbabilities[0].champion * 100).toFixed(1)}%`
                  : "--"
              }
              tone="sky"
              description="Most likely champion from the current board state."
            />
            <InsightCard
              eyebrow="Final Four"
              title={finalFourProbabilities[0]?.team.name ?? "Pending"}
              value={
                finalFourProbabilities[0]
                  ? `${(finalFourProbabilities[0].finalFour * 100).toFixed(1)}%`
                  : "--"
              }
              tone="emerald"
              description="Best Final Four probability in the current simulation run."
            />
            <InsightCard
              eyebrow="Easiest Path"
              title={easiestPaths[0]?.team.name ?? "Pending"}
              value={easiestPaths[0] ? easiestPaths[0].pathDifficulty.toFixed(1) : "--"}
              tone="emerald"
              description="Lowest cumulative path-difficulty score."
            />
            <InsightCard
              eyebrow="Upset Hotspot"
              title={
                bracketUpsets[0]
                  ? `${bracketUpsets[0].teamA.team?.name ?? "TBD"} vs ${bracketUpsets[0].teamB.team?.name ?? "TBD"}`
                  : "No hotspot"
              }
              value={bracketUpsets[0]?.upsetRisk ?? "--"}
              tone="amber"
              description="Highest-risk upset node on the active board."
            />
          </div>
          <ChampionProbabilities rows={championProbabilities} title="Most Likely Champions" />
          <ChampionProbabilities
            rows={finalFourProbabilities}
            title="Most Likely Final Four Teams"
            mode="finalFour"
          />
          <EasiestPaths rows={easiestPaths} />
          <HardestPaths rows={hardestPaths} />
          <UpsetWatch bracketGames={bracketUpsets} title="Upset Hotspots" />
        </div>
      </InsightSection>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_380px]">
        <Panel
          eyebrow="Bracket View"
          title="Tournament board"
          description="Click any unlocked winner to override the model, then lock the pick if you want the generator to preserve it."
        >
          <BracketBoard rounds={rounds} mode={mode} onPick={handlePick} onToggleLock={handleToggleLock} />
        </Panel>

        <div className="space-y-6">
          <BracketSummaryPanel summary={summary} />
          <PathDifficultyPanel
            paths={paths}
            champion={summary.champion ?? displaySimulation.champion}
            resolvedGames={resolvedGames}
            tournamentSummary={tournamentSummary}
          />
        </div>
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
                      <TeamChip name={row.team.name} shortName={row.team.shortName} compact />
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
