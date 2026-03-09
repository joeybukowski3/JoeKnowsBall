"use client";

import type { ResolvedBracketGame, TournamentSimulationResult } from "@/lib/types";

type TournamentSimulationPanelProps = {
  iterationCount: number;
  onIterationChange: (iterations: number) => void;
  onRun: () => void;
  result: TournamentSimulationResult | null;
  upsetHotspots: ResolvedBracketGame[];
};

const iterationOptions = [1000, 5000, 10000];

export function TournamentSimulationPanel({
  iterationCount,
  onIterationChange,
  onRun,
  result,
  upsetHotspots,
}: TournamentSimulationPanelProps) {
  const titleLeaders = result?.rows.slice(0, 10) ?? [];
  const finalFourLeaders = [...(result?.rows ?? [])]
    .sort((left, right) => right.finalFour - left.finalFour)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Tournament Simulation
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {iterationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onIterationChange(option)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                iterationCount === option
                  ? "bg-slate-100 text-slate-950"
                  : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white"
              }`}
            >
              {option.toLocaleString()}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onRun}
          className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          Run simulation
        </button>
        <p className="mt-4 text-sm text-slate-400">
          Simulates from the current bracket state, honoring any picks already made
          in the board when possible.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Most likely champion
        </p>
        <p className="mt-3 text-2xl font-semibold text-sky-300">
          {result?.champion?.name ?? "Run a simulation"}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {result
            ? `${(((titleLeaders[0]?.champion ?? 0) * 100)).toFixed(1)}% title probability over ${result.iterations.toLocaleString()} iterations.`
            : "Champion probabilities will populate after the first run."}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Top 10 title probabilities
        </h3>
        <div className="mt-4 space-y-3">
          {titleLeaders.map((row) => (
            <div key={row.team.id} className="flex items-center justify-between gap-3">
              <p className="text-sm text-white">{row.team.name}</p>
              <span className="text-sm text-sky-300">
                {(row.champion * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Top 10 Final Four probabilities
        </h3>
        <div className="mt-4 space-y-3">
          {finalFourLeaders.map((row) => (
            <div key={row.team.id} className="flex items-center justify-between gap-3">
              <p className="text-sm text-white">{row.team.name}</p>
              <span className="text-sm text-emerald-300">
                {(row.finalFour * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
          Upset hotspots
        </h3>
        <div className="mt-4 space-y-3">
          {upsetHotspots.slice(0, 6).map((game) => (
            <div key={game.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-sm font-medium text-white">
                {game.teamA.team?.name ?? "TBD"} vs {game.teamB.team?.name ?? "TBD"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {game.round} • {game.upsetRisk} risk
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
