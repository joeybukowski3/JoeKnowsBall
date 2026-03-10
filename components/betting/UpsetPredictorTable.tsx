import { ConfidenceBadge } from "@/components/betting/ConfidenceBadge";
import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import type { UpsetPredictionRow } from "@/lib/types";

type UpsetPredictorTableProps = {
  rows: UpsetPredictionRow[];
};

export function UpsetPredictorTable({ rows }: UpsetPredictorTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <table className="min-w-full divide-y divide-white/10 text-left">
        <thead className="bg-slate-950/80">
          <tr className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <th className="px-4 py-3">Matchup</th>
            <th className="px-4 py-3">Underdog</th>
            <th className="px-4 py-3 text-right">Upset %</th>
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Reasons</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8 bg-white/[0.03]">
          {rows.map((row) => (
            <tr key={row.id} className="transition hover:bg-white/[0.04]">
              <td className="px-4 py-3">
                <p className="text-sm font-semibold text-white">{row.matchup}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Favorite: {row.favorite.shortName}
                </p>
              </td>
              <td className="px-4 py-3">
                <TeamChip team={row.underdog} name={row.underdog.name} shortName={row.underdog.shortName} compact />
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-amber-200">
                {(row.upsetProbability * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-3">
                <Badge
                  tone={
                    row.upsetSeverity === "Danger Zone"
                      ? "rose"
                      : row.upsetSeverity === "Live Dog"
                        ? "amber"
                        : "sky"
                  }
                >
                  {row.upsetSeverity}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <ConfidenceBadge tier={row.confidenceTier} />
              </td>
              <td className="px-4 py-3">
                <p className="text-sm text-slate-300">{row.reasons.join(" • ")}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
