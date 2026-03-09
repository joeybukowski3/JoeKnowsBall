import type { Game, MatchupSummary } from "@/lib/types";

type BettingComparisonProps = {
  summary: MatchupSummary;
  game?: Game;
};

function formatMoneyline(price: number) {
  return price > 0 ? `+${price}` : `${price}`;
}

function formatSpread(spread: number) {
  return spread > 0 ? `+${spread}` : `${spread}`;
}

export function BettingComparison({ summary, game }: BettingComparisonProps) {
  const valueTone =
    summary.valueIndicator === "Strong"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : summary.valueIndicator === "Watch"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-slate-700 bg-slate-900 text-slate-300";

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_320px]">
      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left">
          <thead className="bg-slate-900/90">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Sportsbook</th>
              <th className="px-4 py-3">Model</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-white">Spread</td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {summary.teamA.team.name} {game ? formatSpread(summary.marketSpread) : "-"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {summary.teamA.team.name} {formatSpread(summary.modelSpread)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-white">Moneyline</td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {game
                  ? `${summary.teamA.team.shortName} ${formatMoneyline(game.moneylineAway)} / ${summary.teamB.team.shortName} ${formatMoneyline(game.moneylineHome)}`
                  : "Manual mode"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {`${summary.teamA.team.shortName} ${(summary.teamA.winProbability * 100).toFixed(1)}% / ${summary.teamB.team.shortName} ${(summary.teamB.winProbability * 100).toFixed(1)}%`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Value Indicator
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-white">Market vs model</p>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${valueTone}`}>
            {summary.valueIndicator}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Placeholder betting read based on the gap between the mock sportsbook
          spread and the model spread estimate.
        </p>
      </div>
    </div>
  );
}
