"use client";

import { LockedPickBadge } from "@/components/bracket/LockedPickBadge";
import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import type { BracketMode, ResolvedBracketGame } from "@/lib/types";

type BracketGameProps = {
  game: ResolvedBracketGame;
  mode: BracketMode;
  onPick: (gameId: string, teamId: string) => void;
  onToggleLock: (gameId: string) => void;
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

function getSeverityTone(severity: ResolvedBracketGame["upsetSeverity"]) {
  switch (severity) {
    case "Major Upset":
      return "rose";
    case "Strong Upset":
      return "amber";
    case "Mild Upset":
      return "emerald";
    default:
      return "neutral";
  }
}

export function BracketGame({ game, mode, onPick, onToggleLock }: BracketGameProps) {
  const teams = [game.teamA, game.teamB];

  return (
    <article className="glass-panel rounded-[28px] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {game.region}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
            {game.round}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge tone={getRiskTone(game.upsetRisk)}>{game.upsetRisk} risk</Badge>
          {game.upsetSeverity !== "None" ? (
            <Badge tone={getSeverityTone(game.upsetSeverity)}>{game.upsetSeverity}</Badge>
          ) : null}
          <LockedPickBadge locked={game.isLocked} />
        </div>
      </div>

      <div className="space-y-2">
        {teams.map((participant) => {
          const isSelected = participant.team && game.winnerTeamId === participant.team.id;
          const canPick = Boolean(participant.team) && !game.isLocked;

          return (
            <button
              key={`${game.id}-${participant.team?.id ?? "empty"}`}
              type="button"
              disabled={!canPick}
              onClick={() => (participant.team ? onPick(game.id, participant.team.id) : undefined)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-indigo-400/40 bg-indigo-500/12 shadow-[0_12px_30px_rgba(79,70,229,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border-white/8 bg-white/[0.035]"
              } ${
                canPick
                  ? "hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/[0.08]"
                  : "cursor-default opacity-85"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <TeamChip
                  team={participant.team}
                  name={participant.team?.name ?? "TBD"}
                  shortName={participant.team?.shortName}
                  subtitle={
                    participant.team
                      ? `${participant.seed ?? "-"} seed • Rank #${participant.rank ?? "--"}`
                      : "Awaiting winner"
                  }
                  compact
                />
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-200">
                    {participant.modelScore?.toFixed(1) ?? "--"}
                  </p>
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

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Why this pick
          </p>
          <p className="mt-1 text-xs text-slate-300">
            {game.pickReason?.label ?? "No winner selected yet"}
          </p>
          {game.pickReason ? (
            <p className="mt-1 text-[11px] text-slate-500">{game.pickReason.detail}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={!game.winnerTeamId}
          onClick={() => onToggleLock(game.id)}
          className={`rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
            game.isLocked
              ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
              : "border-white/12 bg-white/8 text-slate-200 hover:border-indigo-400/30 hover:bg-indigo-500/12"
          } ${!game.winnerTeamId ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {game.isLocked ? "Unlock pick" : "Lock pick"}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        {mode === "manual"
          ? "Manual mode: click an unlocked team to override the current winner."
          : "Auto mode: generated winners stay editable until you lock the game."}
      </p>
    </article>
  );
}
