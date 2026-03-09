"use client";

import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
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
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(125,211,252,0.1),rgba(15,23,42,0.38))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
            Tournament Simulation
          </p>
          <Badge tone="sky">Monte Carlo</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {iterationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onIterationChange(option)}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                iterationCount === option
                  ? "bg-white text-slate-950"
                  : "border border-white/10 bg-slate-950/55 text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {option.toLocaleString()}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onRun}
          className="mt-4 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Run simulation
        </button>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          Simulates from the current bracket state and respects locked picks where
          possible.
        </p>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Most likely champion
        </p>
        <div className="mt-4 rounded-[24px] border border-white/8 bg-slate-950/55 p-4">
          {result?.champion ? (
            <TeamChip
              name={result.champion.name}
              shortName={result.champion.shortName}
              subtitle={`${(((titleLeaders[0]?.champion ?? 0) * 100)).toFixed(1)}% title probability`}
            />
          ) : (
            <p className="text-sm text-slate-400">
              Champion probabilities will populate after the first run.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Top title probabilities
          </h3>
          <Badge tone="sky">Top 10</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {titleLeaders.map((row) => (
            <div
              key={row.team.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/55 p-3"
            >
              <TeamChip
                name={row.team.name}
                shortName={row.team.shortName}
                compact
              />
              <div className="text-right">
                <p className="text-sm font-semibold text-sky-200">
                  {(row.champion * 100).toFixed(1)}%
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  champion
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Top Final Four probabilities
          </h3>
          <Badge tone="emerald">Top 10</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {finalFourLeaders.map((row) => (
            <div
              key={row.team.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/55 p-3"
            >
              <TeamChip
                name={row.team.name}
                shortName={row.team.shortName}
                compact
              />
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-200">
                  {(row.finalFour * 100).toFixed(1)}%
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  final four
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Upset hotspots
          </h3>
          <Badge tone="amber">Live board</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {upsetHotspots.slice(0, 6).map((game) => (
            <div
              key={game.id}
              className="rounded-2xl border border-white/8 bg-slate-950/55 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {game.teamA.team?.name ?? "TBD"} vs {game.teamB.team?.name ?? "TBD"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{game.round}</p>
                </div>
                <Badge tone={game.upsetRisk === "High" ? "rose" : "amber"}>
                  {game.upsetRisk}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
