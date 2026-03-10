"use client";

import { BracketGame } from "@/components/bracket/BracketGame";
import type { BracketMode, BracketRound, ResolvedBracketGame } from "@/lib/types";

type BracketBoardProps = {
  rounds: Record<BracketRound, ResolvedBracketGame[]>;
  mode: BracketMode;
  onPick: (gameId: string, teamId: string) => void;
  onToggleLock: (gameId: string) => void;
};

const roundOrder: BracketRound[] = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "Championship",
];

export function BracketBoard({ rounds, mode, onPick, onToggleLock }: BracketBoardProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="grid min-w-[1560px] grid-cols-6 gap-4">
        {roundOrder.map((round) => (
          <section key={round} className="space-y-3">
            <div className="sticky top-24 z-10 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.72))] px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-300">
                {round}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {rounds[round].length} games
              </p>
            </div>
            <div className="space-y-3">
              {rounds[round].map((game) => (
                <BracketGame
                  key={game.id}
                  game={game}
                  mode={mode}
                  onPick={onPick}
                  onToggleLock={onToggleLock}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
