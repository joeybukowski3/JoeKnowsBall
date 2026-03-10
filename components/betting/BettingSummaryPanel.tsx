import { Badge } from "@/components/shared/Badge";
import { ValueCard } from "@/components/betting/ValueCard";
import type { FuturesValueRow, GameValueRow } from "@/lib/types";

type BettingSummaryPanelProps = {
  strongestMoneyline: GameValueRow | null;
  strongestSpread: GameValueRow | null;
  bestFutures: FuturesValueRow | null;
  mostUpsetProne: GameValueRow | null;
  averageEdge: number;
};

export function BettingSummaryPanel({
  strongestMoneyline,
  strongestSpread,
  bestFutures,
  mostUpsetProne,
  averageEdge,
}: BettingSummaryPanelProps) {
  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-[30px] p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200/80">
            Slate Summary
          </p>
          <Badge tone="sky">NCAA</Badge>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Highest-confidence value indicators and volatility signals across the
          currently visible card.
        </p>
      </div>

      <ValueCard
        eyebrow="Moneyline"
        title={strongestMoneyline?.matchup ?? "No edge"}
        value={
          strongestMoneyline
            ? `${(strongestMoneyline.moneylineEdge * 100).toFixed(1)}%`
            : "--"
        }
        strengthValue={strongestMoneyline ? Math.abs(strongestMoneyline.moneylineEdge) * 1000 : null}
        tone="positive"
        description="Largest model edge versus the implied moneyline on the filtered slate."
      />
      <ValueCard
        eyebrow="Spread"
        title={strongestSpread?.matchup ?? "No edge"}
        value={strongestSpread ? `${strongestSpread.spreadEdge.toFixed(1)} pts` : "--"}
        strengthValue={strongestSpread ? Math.abs(strongestSpread.spreadEdge) * 12 : null}
        description="Biggest gap between market spread and model spread estimate."
      />
      <ValueCard
        eyebrow="Futures"
        title={bestFutures?.team.name ?? "No futures value"}
        value={bestFutures ? `${(bestFutures.futuresEdge * 100).toFixed(1)}%` : "--"}
        strengthValue={bestFutures ? Math.abs(bestFutures.futuresEdge) * 1000 : null}
        tone="positive"
        description="Best title futures discrepancy after blending rankings, path, and simulation."
      />
      <ValueCard
        eyebrow="Volatility"
        title={mostUpsetProne?.matchup ?? "No hotspot"}
        value={mostUpsetProne?.upsetRisk ?? "--"}
        strengthValue={
          mostUpsetProne
            ? mostUpsetProne.upsetRisk === "High"
              ? 100
              : mostUpsetProne.upsetRisk === "Medium"
                ? 66
                : 33
            : null
        }
        tone="neutral"
        description="Most upset-prone matchup based on seed, rank, and model proximity."
      />
      <ValueCard
        eyebrow="Slate"
        title="Average model edge"
        value={`${(averageEdge * 100).toFixed(1)}%`}
        strengthValue={Math.abs(averageEdge) * 1000}
        description="Mean moneyline edge across the currently visible game slate."
      />
    </div>
  );
}
