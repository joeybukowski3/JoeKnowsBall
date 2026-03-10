import Link from "next/link";
import { ConfidenceBadge } from "@/components/betting/ConfidenceBadge";
import { ValueTierBadge } from "@/components/betting/ValueTierBadge";
import { Badge } from "@/components/shared/Badge";
import type { BestBetRow, DataSource, UpsetPredictionRow } from "@/lib/types";

type BestBetsHeroProps = {
  dataSource: DataSource;
  bestOverall: BestBetRow | null;
  strongestUpset: UpsetPredictionRow | null;
  strongestFuture: BestBetRow | null;
};

export function BestBetsHero({
  dataSource,
  bestOverall,
  strongestUpset,
  strongestFuture,
}: BestBetsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.48))] p-7 shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="emerald">Best Bets Today</Badge>
            <Badge tone={dataSource === "live" ? "sky" : "amber"}>
              {dataSource === "live" ? "Live NCAA + Odds Data" : "Mock Fallback Active"}
            </Badge>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200/85">
              Daily Cheat Sheet
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              The cleanest NCAA value board for today’s slate.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300">
              Moneyline edges, spread values, upset candidates, and futures angles from the current model, live odds context, and tournament simulation stack.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/betting"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Open full betting board
            </Link>
            <Link
              href="/ncaa/insights"
              className="rounded-2xl border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/14"
            >
              NCAA insights hub
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Best Overall Bet
            </p>
            <p className="mt-3 text-xl font-semibold text-white">
              {bestOverall?.selection ?? "No qualifying edge"}
            </p>
            <p className="mt-1 text-sm text-slate-300">{bestOverall?.matchup ?? "Pending slate"}</p>
            {bestOverall ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <ValueTierBadge tier={bestOverall.valueTier} />
                <ConfidenceBadge tier={bestOverall.confidenceTier} />
              </div>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Upset Radar
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {strongestUpset?.underdog.name ?? "No live upset spot"}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {strongestUpset
                  ? `${(strongestUpset.upsetProbability * 100).toFixed(1)}% upset chance`
                  : "--"}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Best Future
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {strongestFuture?.team?.name ?? "No futures value"}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {strongestFuture ? `${(strongestFuture.edge * 100).toFixed(1)}% futures edge` : "--"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
