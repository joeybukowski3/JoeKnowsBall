"use client";

import { BracketGame } from "@/components/bracket/BracketGame";
import type { BracketMode, BracketRound, ResolvedBracketGame } from "@/lib/types";

type BracketBoardProps = {
  rounds: Record<BracketRound, ResolvedBracketGame[]>;
  mode: BracketMode;
  onPick: (gameId: string, teamId: string) => void;
};

const roundOrder: BracketRound[] = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "Championship",
];

export function BracketBoard({ rounds, mode, onPick }: BracketBoardProps) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[1500px] grid-cols-6 gap-4">
        {roundOrder.map((round) => (
          <section key={round} className="space-y-3">
            <div className="sticky top-24 z-10 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                {round}
              </p>
            </div>
            {rounds[round].map((game) => (
              <BracketGame
                key={game.id}
                game={game}
                mode={mode}
                onPick={onPick}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
