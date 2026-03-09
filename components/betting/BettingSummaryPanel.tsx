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
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(125,211,252,0.1),rgba(15,23,42,0.36))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/80">
            Slate Summary
          </p>
          <Badge tone="sky">NCAA</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">
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
        description="Largest model edge versus the implied moneyline on the filtered slate."
      />
      <ValueCard
        eyebrow="Spread"
        title={strongestSpread?.matchup ?? "No edge"}
        value={strongestSpread ? `${strongestSpread.spreadEdge.toFixed(1)} pts` : "--"}
        description="Biggest gap between market spread and model spread estimate."
      />
      <ValueCard
        eyebrow="Futures"
        title={bestFutures?.team.name ?? "No futures value"}
        value={bestFutures ? `${(bestFutures.futuresEdge * 100).toFixed(1)}%` : "--"}
        description="Best title futures discrepancy after blending rankings, path, and simulation."
      />
      <ValueCard
        eyebrow="Volatility"
        title={mostUpsetProne?.matchup ?? "No hotspot"}
        value={mostUpsetProne?.upsetRisk ?? "--"}
        description="Most upset-prone matchup based on seed, rank, and model proximity."
      />
      <ValueCard
        eyebrow="Slate"
        title="Average model edge"
        value={`${(averageEdge * 100).toFixed(1)}%`}
        description="Mean moneyline edge across the currently visible game slate."
      />
    </div>
  );
}
