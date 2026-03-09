import type { Game } from "@/lib/types";

type BracketBoardProps = {
  games: Game[];
};

export function BracketBoard({ games }: BracketBoardProps) {
  const regions = ["East", "West", "South", "Midwest"];

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {regions.map((region, index) => (
        <div
          key={region}
          className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              {region}
            </h3>
            <span className="text-xs text-slate-400">Region {index + 1}</span>
          </div>
          <div className="space-y-3">
            {games.slice(index * 2, index * 2 + 2).map((game) => (
              <div
                key={game.id}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"
              >
                <p className="text-sm font-semibold text-white">
                  {game.awaySeed} {game.awayTeam}
                </p>
                <p className="text-xs text-slate-400">vs</p>
                <p className="text-sm font-semibold text-white">
                  {game.homeSeed} {game.homeTeam}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
