"use client";

import Link from "next/link";
import { BestBetsTable } from "@/components/betting/BestBetsTable";
import { UpsetPredictorTable } from "@/components/betting/UpsetPredictorTable";
import { ChampionProbabilities } from "@/components/insights/ChampionProbabilities";
import { EasiestPaths } from "@/components/insights/EasiestPaths";
import { FuturesValueWatch } from "@/components/insights/FuturesValueWatch";
import { InsightCard } from "@/components/insights/InsightCard";
import { InsightSection } from "@/components/insights/InsightSection";
import { Badge } from "@/components/shared/Badge";
import { ModelStatusIndicator } from "@/components/shared/ModelStatusIndicator";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import type { DataSource, FuturesMarket, Game, RankingPreset, Team } from "@/lib/types";
import { buildBestBetsSnapshot } from "@/lib/utils/bestBets";
import {
  buildBracketCheatSheet,
  buildChampionProbabilities,
  buildEasiestPaths,
} from "@/lib/utils/insightBuilders";
import { buildModelStatusSummary } from "@/lib/utils/modelStatus";

type NcaaInsightsDashboardProps = {
  teams: Team[];
  bracketTeams: Team[];
  games: Game[];
  futuresMarkets: FuturesMarket[];
  bracketGames: import("@/lib/types").BracketGameNode[];
  preset: RankingPreset;
  dataSource?: DataSource;
};

export function NcaaInsightsDashboard({
  teams,
  bracketTeams,
  games,
  futuresMarkets,
  bracketGames,
  preset,
  dataSource = "mock",
}: NcaaInsightsDashboardProps) {
  const snapshot = buildBestBetsSnapshot({
    teams,
    bracketTeams,
    games,
    futuresMarkets,
    bracketGames,
    preset,
  });
  const championRows = buildChampionProbabilities(snapshot.simulationResult, 5);
  const easiestPaths = buildEasiestPaths(snapshot.pathRows, 5);
  const cheatSheet = buildBracketCheatSheet({
    bracketTeams,
    bracketRankingRows: snapshot.rankingRows,
    futuresRows: snapshot.futuresRows,
    simulation: snapshot.simulationResult,
    pathRows: snapshot.pathRows,
    upsetRows: snapshot.gameRows,
  });
  const modelStatus = buildModelStatusSummary({
    teams,
    dataSource,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="NCAA Insights"
        title="Daily tournament cheat sheet"
        description="A single NCAA content hub for the strongest value plays, upset warnings, title angles, and tournament takeaways from the current model."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone={dataSource === "live" ? "emerald" : "amber"}>
            {dataSource === "live" ? "Live Data" : "Mock Data Fallback"}
          </Badge>
          <Link
            href="/betting/best-bets"
            className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:border-white/20 hover:bg-white/14"
          >
            Best bets today
          </Link>
        </div>
      </PageHeader>

      <InsightSection
        eyebrow="Daily Board"
        title="The strongest signals right now"
        description="Best bets, upset hotspots, title favorites, and path leverage in one shareable NCAA cheat sheet."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            eyebrow="Best Bet"
            title={snapshot.bestOverall[0]?.selection ?? "Pending"}
            value={snapshot.bestOverall[0] ? `${(snapshot.bestOverall[0].edge * 100).toFixed(1)}%` : "--"}
            tone="emerald"
            description={snapshot.bestOverall[0]?.matchup ?? "No qualifying angle yet."}
          />
          <InsightCard
            eyebrow="Upset Watch"
            title={snapshot.upsetPredictions[0]?.underdog.name ?? "Pending"}
            value={snapshot.upsetPredictions[0] ? `${(snapshot.upsetPredictions[0].upsetProbability * 100).toFixed(1)}%` : "--"}
            tone="amber"
            description={snapshot.upsetPredictions[0]?.matchup ?? "No live underdog spot yet."}
          />
          <InsightCard
            eyebrow="Champion"
            title={championRows[0]?.team.name ?? "Pending"}
            value={championRows[0] ? `${(championRows[0].champion * 100).toFixed(1)}%` : "--"}
            tone="sky"
            description="Top simulated title outcome."
          />
          <InsightCard
            eyebrow="Path"
            title={easiestPaths[0]?.team.name ?? "Pending"}
            value={easiestPaths[0] ? easiestPaths[0].pathDifficulty.toFixed(1) : "--"}
            tone="emerald"
            description="Lowest path-difficulty score in the field."
          />
        </div>
      </InsightSection>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
        <div className="space-y-6">
          <Panel eyebrow="Best Value Plays Today" title="Top 5 best overall bets" description="Daily market angles from the current NCAA slate and title board.">
            <BestBetsTable rows={snapshot.bestOverall} />
          </Panel>
          <Panel eyebrow="Upset Predictor" title="Most live underdogs" description="Model-supported underdogs that can pressure the favorite beyond the market expectation.">
            <UpsetPredictorTable rows={snapshot.upsetPredictions.slice(0, 6)} />
          </Panel>
          <ChampionProbabilities rows={championRows} title="Most Likely Champions" />
          <EasiestPaths rows={easiestPaths} />
        </div>

        <div className="space-y-6">
          <Panel eyebrow="Bracket Cheat Sheet" title="Quick tournament guide" description="Fast tournament context for top seeds, dark horses, upset spots, and regional power.">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Strongest 1-4 seeds</p>
                <p className="mt-2 text-sm text-white">
                  {cheatSheet.strongestTopSeeds.map((team) => team.shortName).join(", ")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Dangerous lower seeds</p>
                <p className="mt-2 text-sm text-white">
                  {cheatSheet.dangerousLowerSeeds.map((team) => team.shortName).join(", ")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Best title values</p>
                <p className="mt-2 text-sm text-white">
                  {cheatSheet.bestTitleValues.map((row) => row.team.shortName).join(", ")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Strongest region</p>
                  <p className="mt-2 text-sm text-white">{cheatSheet.strongestRegion?.region ?? "Pending"}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Weakest region</p>
                  <p className="mt-2 text-sm text-white">{cheatSheet.weakestRegion?.region ?? "Pending"}</p>
                </div>
              </div>
            </div>
          </Panel>
          <FuturesValueWatch rows={snapshot.futuresRows.slice(0, 5)} title="Best Futures Value" />
        </div>
      </div>

      <ModelStatusIndicator status={modelStatus} />
    </div>
  );
}
