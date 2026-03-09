import { Badge } from "@/components/shared/Badge";
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
  const valueTone = summary.valueIndicator === "Strong" ? "emerald" : summary.valueIndicator === "Watch" ? "amber" : "neutral";

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_320px]">
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <table className="min-w-full divide-y divide-white/8 text-left">
          <thead className="bg-white/[0.06]">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Sportsbook</th>
              <th className="px-4 py-3">Model</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8 bg-transparent">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-white">Spread</td>
              <td className="px-4 py-3 text-sm text-slate-300">{summary.teamA.team.name} {game ? formatSpread(summary.marketSpread) : "-"}</td>
              <td className="px-4 py-3 text-sm text-slate-300">{summary.teamA.team.name} {formatSpread(summary.modelSpread)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-white">Moneyline</td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {game ? `${summary.teamA.team.shortName} ${formatMoneyline(game.moneylineAway)} / ${summary.teamB.team.shortName} ${formatMoneyline(game.moneylineHome)}` : "Manual mode"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {`${summary.teamA.team.shortName} ${(summary.teamA.winProbability * 100).toFixed(1)}% / ${summary.teamB.team.shortName} ${(summary.teamB.winProbability * 100).toFixed(1)}%`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Value Indicator</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-white">Market vs model</p>
          <Badge tone={valueTone}>{summary.valueIndicator}</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Placeholder betting read based on the gap between the mock sportsbook spread and the model spread estimate.
        </p>
      </div>
    </div>
  );
}
