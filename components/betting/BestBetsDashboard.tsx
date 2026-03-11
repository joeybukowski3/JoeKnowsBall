"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BestBetsHero } from "@/components/betting/BestBetsHero";
import { BestBetsTable } from "@/components/betting/BestBetsTable";
import { UpsetPredictorTable } from "@/components/betting/UpsetPredictorTable";
import { FuturesValueWatch } from "@/components/insights/FuturesValueWatch";
import { InsightCard } from "@/components/insights/InsightCard";
import { InsightSection } from "@/components/insights/InsightSection";
import { Badge } from "@/components/shared/Badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import type { DataSource, FuturesMarket, Game, RankingPreset, Team } from "@/lib/types";
import { buildBestBetsSnapshot, filterBestBetRows, filterUpsetPredictions } from "@/lib/utils/bestBets";

type BestBetsDashboardProps = {
  teams: Team[];
  bracketTeams: Team[];
  games: Game[];
  futuresMarkets: FuturesMarket[];
  bracketGames: import("@/lib/types").BracketGameNode[];
  presets: RankingPreset[];
  dataSource?: DataSource;
};

type SortMode = "edge" | "confidence" | "upset" | "futures";

export function BestBetsDashboard({
  teams,
  bracketTeams,
  games,
  futuresMarkets,
  bracketGames,
  presets,
  dataSource = "mock",
}: BestBetsDashboardProps) {
  const [presetId, setPresetId] = useState(presets[0]?.id ?? "");
  const [sortMode, setSortMode] = useState<SortMode>("edge");

  const selectedPreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
  const snapshot = useMemo(
    () =>
      buildBestBetsSnapshot({
        teams,
        bracketTeams,
        games,
        futuresMarkets,
        bracketGames,
        preset: selectedPreset,
      }),
    [bracketGames, bracketTeams, futuresMarkets, games, selectedPreset, teams],
  );

  const bestOverall = filterBestBetRows(snapshot.bestOverall, sortMode);
  const moneylineRows = filterBestBetRows(snapshot.moneylineRows, sortMode).slice(0, 8);
  const spreadRows = filterBestBetRows(snapshot.spreadRows, sortMode).slice(0, 8);
  const futuresRows = filterBestBetRows(snapshot.futuresBetRows, sortMode).slice(0, 8);
  const upsetRows = filterUpsetPredictions(snapshot.upsetPredictions, sortMode).slice(0, 8);
  const highConfidence = filterBestBetRows(snapshot.highestConfidence, sortMode).slice(0, 5);
  const highRiskReward = filterBestBetRows(snapshot.highRiskReward, sortMode).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Best Bets Today"
        title="Daily NCAA betting cheat sheet"
        description="A tighter daily workflow for scanning the strongest moneyline values, spread spots, upset candidates, and title futures from the active model."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone={dataSource === "live" ? "emerald" : "amber"}>
            {dataSource === "live" ? "Live Data" : "Mock Data Fallback"}
          </Badge>
          <Link
            href="/betting"
            className="ghost-button px-4 py-2 text-xs uppercase tracking-[0.18em]"
          >
            Full betting board
          </Link>
        </div>
      </PageHeader>

      <BestBetsHero
        dataSource={dataSource}
        bestOverall={bestOverall[0] ?? null}
        strongestUpset={snapshot.strongestUpset}
        strongestFuture={snapshot.strongestFuture}
      />

      <div className="surface-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedPreset.id}
              onChange={(event) => setPresetId(event.target.value)}
              className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition hover:border-[var(--accent-mid)]"
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
            <div className="inline-flex rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-1">
              {(["edge", "confidence", "upset", "futures"] as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  className={`rounded-[7px] border px-4 py-2 text-sm font-semibold transition ${
                    sortMode === mode
                      ? "border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]"
                      : "border-transparent text-[var(--muted)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                  }`}
                >
                  {mode === "edge"
                    ? "Highest Edge"
                    : mode === "confidence"
                      ? "Highest Confidence"
                      : mode === "upset"
                        ? "Biggest Upset Chance"
                        : "Strongest Futures"}
                </button>
              ))}
            </div>
          </div>
          <p className="max-w-2xl text-sm text-[var(--muted)]">
            This board reuses the current matchup, ranking, odds, and tournament-simulation layers so daily picks stay aligned with the rest of the product.
          </p>
        </div>
      </div>

      <InsightSection
        eyebrow="Top Summary"
        title="Best daily signals"
        description="Quick-glance cards for the top overall bet, strongest futures edge, biggest upset alert, and most stable play."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            eyebrow="Best Bet"
            title={bestOverall[0]?.selection ?? "Pending"}
            value={bestOverall[0] ? `${(bestOverall[0].edge * 100).toFixed(1)}%` : "--"}
            tone="emerald"
            description={bestOverall[0]?.matchup ?? "No qualifying edge yet."}
          />
          <InsightCard
            eyebrow="Moneyline"
            title={snapshot.strongestMoneyline?.selection ?? "Pending"}
            value={snapshot.strongestMoneyline ? `${(snapshot.strongestMoneyline.edge * 100).toFixed(1)}%` : "--"}
            tone="sky"
            description={snapshot.strongestMoneyline?.matchup ?? "No moneyline angle yet."}
          />
          <InsightCard
            eyebrow="Futures"
            title={snapshot.strongestFuture?.selection ?? "Pending"}
            value={snapshot.strongestFuture ? `${(snapshot.strongestFuture.edge * 100).toFixed(1)}%` : "--"}
            tone="sky"
            description={snapshot.strongestFuture?.matchup ?? "No futures value yet."}
          />
          <InsightCard
            eyebrow="Upset"
            title={snapshot.strongestUpset?.underdog.name ?? "Pending"}
            value={snapshot.strongestUpset ? `${(snapshot.strongestUpset.upsetProbability * 100).toFixed(1)}%` : "--"}
            tone="amber"
            description={snapshot.strongestUpset?.matchup ?? "No upset hotspot yet."}
          />
        </div>
      </InsightSection>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.68fr)_360px]">
        <div className="space-y-6">
          <Panel eyebrow="Best Bets" title="Top 5 best overall bets" description="The strongest cross-market plays on the current board.">
            <BestBetsTable rows={bestOverall} />
          </Panel>
          <Panel eyebrow="Moneyline Value" title="Best moneyline values" description="Highest model-to-market win probability edges on the slate.">
            <BestBetsTable rows={moneylineRows} />
          </Panel>
          <Panel eyebrow="Spread Value" title="Best spread values" description="The biggest spread disagreements between the model and the board.">
            <BestBetsTable rows={spreadRows} />
          </Panel>
          <Panel eyebrow="Upset Predictor" title="Likely upset spots" description="Underdogs with enough profile strength to push the favorite into a real danger zone.">
            <UpsetPredictorTable rows={upsetRows} />
          </Panel>
          <Panel eyebrow="Futures Value" title="Best futures values" description="Title futures with the cleanest blend of model rank, path, and simulation probability.">
            <BestBetsTable rows={futuresRows} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel eyebrow="Highest Confidence" title="Stable plays" description="Lower-volatility angles with the cleanest support from the current model.">
            <BestBetsTable rows={highConfidence} />
          </Panel>
          <Panel eyebrow="High Risk / High Reward" title="Swing spots" description="Bets with bigger payout potential or upset volatility that still clear the value screen.">
            <BestBetsTable rows={highRiskReward} />
          </Panel>
          <FuturesValueWatch
            rows={snapshot.futuresRows.slice(0, 5)}
            title="Best Futures Values"
          />
        </div>
      </div>
    </div>
  );
}
