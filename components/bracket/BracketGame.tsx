"use client";

import type { BracketMode, ResolvedBracketGame } from "@/lib/types";

type BracketGameProps = {
  game: ResolvedBracketGame;
  mode: BracketMode;
  onPick: (gameId: string, teamId: string) => void;
};

function getRiskTone(risk: ResolvedBracketGame["upsetRisk"]) {
  switch (risk) {
    case "High":
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";
    case "Medium":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "Low":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    default:
      return "border-slate-700 bg-slate-900 text-slate-300";
  }
}

export function BracketGame({ game, mode, onPick }: BracketGameProps) {
  const teams = [
    { slot: "teamA" as const, participant: game.teamA },
    { slot: "teamB" as const, participant: game.teamB },
  ];

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {game.region}
        </p>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getRiskTone(game.upsetRisk)}`}
        >
          {game.upsetRisk} upset risk
        </span>
      </div>
      <div className="space-y-2">
        {teams.map(({ participant }) => {
          const isSelected =
            participant.team && game.winnerTeamId === participant.team.id;

          return (
            <button
              key={`${game.id}-${participant.team?.id ?? "empty"}`}
              type="button"
              disabled={mode !== "manual" || !participant.team}
              onClick={() =>
                participant.team ? onPick(game.id, participant.team.id) : undefined
              }
              className={`w-full rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-sky-500/40 bg-sky-500/10"
                  : "border-slate-800 bg-slate-900/70"
              } ${mode !== "manual" ? "cursor-default" : "hover:border-slate-600 hover:bg-slate-800"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {participant.seed ? `${participant.seed} ` : ""}
                    {participant.team?.name ?? "TBD"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {participant.team ? `Rank #${participant.rank}` : "Awaiting winner"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-sky-300">
                    {participant.modelScore?.toFixed(1) ?? "--"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {participant.winProbability !== null &&
                    participant.winProbability !== undefined
                      ? `${(participant.winProbability * 100).toFixed(1)}%`
                      : "--"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}
