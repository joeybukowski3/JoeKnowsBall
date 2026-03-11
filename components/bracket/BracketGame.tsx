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
    <article className="glass-panel rounded-[10px] p-3">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div>
          <p className="section-label">
            {game.region}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
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

      <div className="space-y-1.5">
        {teams.map((participant) => {
          const isSelected = participant.team && game.winnerTeamId === participant.team.id;
          const canPick = Boolean(participant.team) && !game.isLocked;

          return (
            <button
              key={`${game.id}-${participant.team?.id ?? "empty"}`}
              type="button"
              disabled={!canPick}
              onClick={() => (participant.team ? onPick(game.id, participant.team.id) : undefined)}
              className={`w-full rounded-[8px] border p-2.5 text-left transition ${
                isSelected
                  ? "border-[var(--accent-mid)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              } ${
                canPick
                  ? "hover:-translate-y-0.5 hover:border-[var(--accent-mid)] hover:bg-[#f8fbff]"
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
                  <p className="text-[13px] font-semibold text-[var(--accent)]">
                    {participant.modelScore?.toFixed(1) ?? "--"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">
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

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
        <div>
          <p className="section-label">
            Why this pick
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--text)]">
            {game.pickReason?.label ?? "No winner selected yet"}
          </p>
          {game.pickReason ? (
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">{game.pickReason.detail}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={!game.winnerTeamId}
          onClick={() => onToggleLock(game.id)}
          className={`rounded-[8px] border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
            game.isLocked
              ? "border-[var(--gold-bg)] bg-[var(--gold-bg)] text-[var(--gold)]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent-mid)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
          } ${!game.winnerTeamId ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {game.isLocked ? "Unlock pick" : "Lock pick"}
        </button>
      </div>

      <p className="mt-1.5 text-[10px] text-[var(--muted)]">
        {mode === "manual"
          ? "Manual mode: click an unlocked team to override the current winner."
          : "Auto mode: generated winners stay editable until you lock the game."}
      </p>
    </article>
  );
}
