import Link from "next/link";
import { ChampionProbabilities } from "@/components/insights/ChampionProbabilities";
import { EasiestPaths } from "@/components/insights/EasiestPaths";
import { InsightSection } from "@/components/insights/InsightSection";
import { TopValuePlays } from "@/components/insights/TopValuePlays";
import { UpsetWatch } from "@/components/insights/UpsetWatch";
import { PremiumSportCard } from "@/components/home/PremiumSportCard";
import { QuickLinkCard } from "@/components/home/QuickLinkCard";
import { Badge } from "@/components/shared/Badge";
import { ModelStatusIndicator } from "@/components/shared/ModelStatusIndicator";
import type { DataSource, Game, RankingPreset, Team } from "@/lib/types";
import {
  buildGameValueRows,
  buildEasiestPaths,
  buildTopValuePlays,
  buildUpsetWatch,
} from "@/lib/utils/insightBuilders";
import { buildModelStatusSummary } from "@/lib/utils/modelStatus";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import { buildBracketRankingRows } from "@/lib/utils/tournamentSimulator";

type LandingPageProps = {
  teams: Team[];
  bracketTeams: Team[];
  games: Game[];
  bracketGames: import("@/lib/types").BracketGameNode[];
  preset: RankingPreset;
  dataSource: DataSource;
  updatedAt?: string;
};

export function LandingPage({
  teams,
  bracketTeams,
  games,
  bracketGames,
  preset,
  dataSource,
  updatedAt,
}: LandingPageProps) {
  const gameRows = buildGameValueRows({
    teams,
    games,
    preset,
  });
  const bracketRankingRows = buildBracketRankingRows(bracketTeams, preset);
  const pathRows = pathDifficulty(bracketTeams, bracketGames, bracketRankingRows);
  const championRows = buildStaticChampionRows(pathRows, 3);

  const quickStats = {
    bestValuePlays: buildTopValuePlays(gameRows, 3),
    upsetWatch: buildUpsetWatch(gameRows, 3),
    champions: championRows,
    easiestPaths: buildEasiestPaths(pathRows, 3),
  };
  const modelStatus = buildModelStatusSummary({
    teams,
    dataSource,
    updatedAt,
  });

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.48))] p-7 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-10">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_55%)] lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_400px] lg:items-end">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="emerald">NCAA Tournament Tools Free</Badge>
              <Badge tone={dataSource === "live" ? "sky" : "amber"}>
                {dataSource === "live" ? "Live NCAA Data" : "Mock Fallback Active"}
              </Badge>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-200/90">
                March Launch
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Premium betting analytics for March Madness, with NCAA access open right now.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                Explore customizable power rankings, matchup analysis, bracket
                simulation, and betting value tools built for tournament users.
                NFL, NBA, MLB, and PGA are already staged as part of the Pro roadmap.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/ncaa"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Explore NCAA Rankings
              </Link>
              <Link
                href="/bracket"
                className="rounded-2xl border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-300/30 hover:bg-white/14"
              >
                Open Bracket Builder
              </Link>
              <Link
                href="/betting/best-bets"
                className="rounded-2xl border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-300/30 hover:bg-white/14"
              >
                Today&apos;s Best Bets
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              NCAA tournament access is free for a limited time while the broader
              multi-sport analytics platform rolls out.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Right now
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                Rankings, bracket edges, matchup tools, and value screens.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Built for tournament week workflows: scan the slate, compare teams,
                stress-test the bracket, and surface the best market edges quickly.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Best value play
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {quickStats.bestValuePlays[0]?.matchup ?? "Pending slate"}
                </p>
                <p className="mt-2 text-sm text-emerald-200">
                  {quickStats.bestValuePlays[0]
                    ? `${(quickStats.bestValuePlays[0].moneylineEdge * 100).toFixed(1)}% moneyline edge`
                    : "--"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Top champion
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {quickStats.champions[0]?.team.name ?? "Pending simulation"}
                </p>
                <p className="mt-2 text-sm text-sky-200">
                  {quickStats.champions[0]
                    ? `${(quickStats.champions[0].champion * 100).toFixed(1)}% title probability`
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/85">
            Quick Access
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white">
            Jump straight into the NCAA toolset
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <QuickLinkCard
            eyebrow="Rankings"
            title="NCAA Rankings"
            description="Customize the model, filter the tournament field, and compare the full pool of teams."
            href="/ncaa"
            cta="Open rankings"
          />
          <QuickLinkCard
            eyebrow="Matchup"
            title="Matchup Tool"
            description="Compare any two teams or jump straight into upcoming games with preset-driven edges."
            href="/matchup"
            cta="Compare teams"
          />
          <QuickLinkCard
            eyebrow="Bracket"
            title="Bracket Builder"
            description="Advance winners manually, auto-fill the field, and stress-test the tournament path."
            href="/bracket"
            cta="Build bracket"
          />
          <QuickLinkCard
            eyebrow="Betting"
            title="Betting Page"
            description="Scan game value, futures value, and model-vs-market discrepancies in one view."
            href="/betting"
            cta="View betting board"
          />
          <QuickLinkCard
            eyebrow="Cheat Sheet"
            title="Best Bets Today"
            description="Jump straight into the daily moneyline, spread, upset, and futures cheat sheet."
            href="/betting/best-bets"
            cta="Open cheat sheet"
          />
        </div>
      </section>

      <InsightSection
        eyebrow="Live NCAA Insights"
        title="Useful tournament signals right on the homepage"
        description="A lightweight live strip powered by the same rankings, betting, path, and simulation models behind the core NCAA tools."
      >
        <div className="space-y-6">
          <TopValuePlays rows={quickStats.bestValuePlays} title="Best Value Plays Today" />
          <ChampionProbabilities rows={quickStats.champions} title="Most Likely Champions" />
          <UpsetWatch games={quickStats.upsetWatch} title="Upset Watch" />
          <EasiestPaths rows={quickStats.easiestPaths} title="Easiest Paths" />
        </div>
      </InsightSection>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/85">
            Pro Sports
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white">
            Multi-sport premium modules are already staged
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            NCAA is fully accessible right now. NFL, NBA, MLB, and PGA are positioned as Pro experiences with deeper boards, matchup tools, value models, and premium workflows.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PremiumSportCard
            sport="NFL"
            description="Premium power ratings, matchup tools, spread edges, and weekly board analysis."
          />
          <PremiumSportCard
            sport="NBA"
            description="Model-driven side and total screens, rotation-aware matchup context, and futures tracking."
          />
          <PremiumSportCard
            sport="MLB"
            description="Pitching-driven projections, market movement screens, and value-first daily board tools."
          />
          <PremiumSportCard
            sport="PGA"
            description="Outright value boards, top-20/top-40 market support, and tournament path-style modeling."
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/85">
              Why JKB
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
              Built for bettors who want usable edges, not generic dashboards.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Every module is aimed at one workflow: understand the team profile,
              compare the matchup, pressure-test the bracket, and act on value.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:col-span-3">
          {[
            ["Customizable rankings", "Adjust weights, toggle categories, and tune the board to your own betting lens."],
            ["Matchup analysis", "Compare teams side by side with model scores, category edges, and a plain-language read."],
            ["Bracket simulation", "Run tournament simulations, review path difficulty, and identify upset hotspots quickly."],
            ["Betting value tools", "Surface the strongest moneyline, spread, and futures discrepancies against the market."],
            ["Multi-sport roadmap", "NCAA is live now, with NFL, NBA, MLB, and PGA positioned as the next premium layers."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
            >
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <ModelStatusIndicator status={modelStatus} />

      <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.46))] p-8 shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/85">
              Launch CTA
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white">
              Start with NCAA for free, then unlock the full platform.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-300">
              Dive into March Madness tools now, then move into Pro when you want the broader multi-sport board.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ncaa"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Explore NCAA for Free
            </Link>
            <Link
              href="/pricing"
              className="rounded-2xl border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-300/30 hover:bg-white/14"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function buildStaticChampionRows(rows: ReturnType<typeof pathDifficulty>, limit: number) {
  const sorted = [...rows].slice(0, limit);
  const totalAdjusted = sorted.reduce(
    (sum, row) => sum + Math.max(row.adjustedTournamentScore, 1),
    0,
  );

  return sorted.map((row, index) => {
    const champion = Math.max(
      0.04,
      Math.min(0.34, Math.max(row.adjustedTournamentScore, 1) / Math.max(totalAdjusted, 1)),
    );
    const championshipGame = Math.min(0.68, champion * 1.85 + 0.08);
    const finalFour = Math.min(0.78, champion * 2.45 + 0.14);
    const elite8 = Math.min(0.86, finalFour + 0.1);
    const sweet16 = Math.min(0.93, elite8 + 0.08);

    return {
      team: row.team,
      roundOf32: Math.min(0.97, sweet16 + 0.03),
      sweet16,
      elite8,
      finalFour,
      championshipGame,
      champion: Number((champion - index * 0.005).toFixed(4)),
    };
  });
}
