"use client";

import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import type { BracketMode, ResolvedBracketGame } from "@/lib/types";

type BracketGameProps = {
  game: ResolvedBracketGame;
  mode: BracketMode;
  onPick: (gameId: string, teamId: string) => void;
};

function getRiskTone(risk: ResolvedBracketGame["upsetRisk"]) {
  switch (risk) {
    case "High":
      return "rose";
    case "Medium":
      return "amber";
    case "Low":
      return "emerald";
    default:
      return "neutral";
  }
}

export function BracketGame({ game, mode, onPick }: BracketGameProps) {
  const teams = [game.teamA, game.teamB];

  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.045] p-3 shadow-[0_20px_50px_rgba(2,6,23,0.18)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{game.region}</p>
        <Badge tone={getRiskTone(game.upsetRisk)}>{game.upsetRisk} risk</Badge>
      </div>
      <div className="space-y-2">
        {teams.map((participant) => {
          const isSelected = participant.team && game.winnerTeamId === participant.team.id;
          return (
            <button
              key={`${game.id}-${participant.team?.id ?? "empty"}`}
              type="button"
              disabled={mode !== "manual" || !participant.team}
              onClick={() => (participant.team ? onPick(game.id, participant.team.id) : undefined)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-sky-400/40 bg-sky-400/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border-white/8 bg-white/[0.04]"
              } ${mode !== "manual" ? "cursor-default" : "hover:border-sky-300/20 hover:bg-white/[0.08]"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <TeamChip
                  name={participant.team?.name ?? "TBD"}
                  shortName={participant.team?.shortName}
                  subtitle={participant.team ? `${participant.seed ?? "-"} seed - Rank #${participant.rank}` : "Awaiting winner"}
                  compact
                />
                <div className="text-right">
                  <p className="text-sm font-semibold text-sky-300">{participant.modelScore?.toFixed(1) ?? "--"}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {participant.winProbability !== null && participant.winProbability !== undefined
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
