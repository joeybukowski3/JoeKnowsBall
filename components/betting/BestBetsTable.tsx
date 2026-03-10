import { ConfidenceBadge } from "@/components/betting/ConfidenceBadge";
import { ValueTierBadge } from "@/components/betting/ValueTierBadge";
import { TeamChip } from "@/components/shared/TeamChip";
import type { BestBetRow } from "@/lib/types";

type BestBetsTableProps = {
  rows: BestBetRow[];
  title?: string;
};

export function BestBetsTable({ rows, title }: BestBetsTableProps) {
  return (
    <div className="space-y-4">
      {title ? <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{title}</h3> : null}
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-left">
          <thead className="bg-slate-950/80">
            <tr className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              <th className="px-4 py-3">Bet</th>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3 text-right">Edge</th>
              <th className="px-4 py-3 text-right">Model</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8 bg-white/[0.03]">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-white/[0.04]">
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{row.selection}</p>
                    <p className="text-xs text-slate-400">{row.matchup}</p>
                    {row.team ? <TeamChip name={row.team.name} shortName={row.team.shortName} compact /> : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-200">
                  <p>{row.line}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{row.marketType}</p>
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-200">
                  {(row.edge * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-200">
                  {(row.modelProbability * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <ValueTierBadge tier={row.valueTier} />
                </td>
                <td className="px-4 py-3">
                  <ConfidenceBadge tier={row.confidenceTier} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
