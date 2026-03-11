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
    <div className="space-y-6">
      <section className="glass-panel relative overflow-hidden rounded-[10px] p-4 sm:p-5">
        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-start">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="emerald">NCAA Tournament Tools Free</Badge>
              <Badge tone={dataSource === "live" ? "sky" : "amber"}>
                {dataSource === "live" ? "Live NCAA Data" : "Mock Fallback Active"}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="section-label">
                March Launch
              </p>
              <h1 className="page-title max-w-3xl text-[21px] sm:text-[24px]">
                Premium March Madness analytics, open for NCAA right now.
              </h1>
              <p className="max-w-3xl text-[13px] leading-5 text-[var(--muted)]">
                Explore customizable power rankings, matchup analysis, bracket
                simulation, and betting value tools built for tournament users.
                NFL, NBA, MLB, and PGA are already staged as part of the Pro roadmap.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/ncaa"
                className="primary-button px-4 py-2.5"
              >
                Explore NCAA Rankings
              </Link>
              <Link
                href="/bracket"
                className="ghost-button px-4 py-2.5"
              >
                Open Bracket Builder
              </Link>
              <Link
                href="/betting/best-bets"
                className="ghost-button px-4 py-2.5"
              >
                Today&apos;s Best Bets
              </Link>
            </div>
            <p className="text-[12px] text-[var(--muted)]">
              NCAA tournament access is free for a limited time while the broader
              multi-sport analytics platform rolls out.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="surface-card p-3.5">
              <p className="section-label">
                Right now
              </p>
              <p className="mt-1.5 text-[16px] font-extrabold leading-5 text-[var(--text)]">
                Rankings, bracket edges, matchup tools, and value screens.
              </p>
              <p className="mt-1.5 text-[13px] leading-5 text-[var(--muted)]">
                Built for tournament week workflows: scan the slate, compare teams,
                stress-test the bracket, and surface the best market edges quickly.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-card p-3">
                <p className="section-label">
                  Best value play
                </p>
                <p className="mt-1.5 text-[14px] font-extrabold leading-5 text-[var(--text)]">
                  {quickStats.bestValuePlays[0]?.matchup ?? "Pending slate"}
                </p>
                <p className="mt-1 text-[12px] text-[var(--green)]">
                  {quickStats.bestValuePlays[0]
                    ? `${(quickStats.bestValuePlays[0].moneylineEdge * 100).toFixed(1)}% moneyline edge`
                    : "--"}
                </p>
              </div>
              <div className="surface-card p-3">
                <p className="section-label">
                  Top champion
                </p>
                <p className="mt-1.5 text-[14px] font-extrabold leading-5 text-[var(--text)]">
                  {quickStats.champions[0]?.team.name ?? "Pending simulation"}
                </p>
                <p className="mt-1 text-[12px] text-[var(--accent)]">
                  {quickStats.champions[0]
                    ? `${(quickStats.champions[0].champion * 100).toFixed(1)}% title probability`
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-2">
            <p className="section-label">
              Quick Access
            </p>
          <h2 className="page-title text-[20px]">
            Jump straight into the NCAA toolset
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
        <div className="space-y-4">
          <TopValuePlays rows={quickStats.bestValuePlays} title="Best Value Plays Today" />
          <ChampionProbabilities rows={quickStats.champions} title="Most Likely Champions" />
          <UpsetWatch games={quickStats.upsetWatch} title="Upset Watch" />
          <EasiestPaths rows={quickStats.easiestPaths} title="Easiest Paths" />
        </div>
      </InsightSection>

      <section className="space-y-3">
        <div className="space-y-2">
            <p className="section-label">
              Pro Sports
            </p>
          <h2 className="page-title text-[20px]">
            Multi-sport premium modules are already staged
          </h2>
          <p className="max-w-3xl text-[13px] leading-5 text-[var(--muted)]">
            NCAA is fully accessible right now. NFL, NBA, MLB, and PGA are positioned as Pro experiences with deeper boards, matchup tools, value models, and premium workflows.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

      <section className="grid gap-3 xl:grid-cols-5">
        <div className="xl:col-span-2">
            <div className="surface-card p-4">
            <p className="section-label">
              Why JKB
            </p>
            <h2 className="page-title mt-2 text-[20px]">
              Built for bettors who want usable edges, not generic dashboards.
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">
              Every module is aimed at one workflow: understand the team profile,
              compare the matchup, pressure-test the bracket, and act on value.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:col-span-3">
          {[
            ["Customizable rankings", "Adjust weights, toggle categories, and tune the board to your own betting lens."],
            ["Matchup analysis", "Compare teams side by side with model scores, category edges, and a plain-language read."],
            ["Bracket simulation", "Run tournament simulations, review path difficulty, and identify upset hotspots quickly."],
            ["Betting value tools", "Surface the strongest moneyline, spread, and futures discrepancies against the market."],
            ["Multi-sport roadmap", "NCAA is live now, with NFL, NBA, MLB, and PGA positioned as the next premium layers."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="surface-card p-4"
            >
              <h3 className="text-[15px] font-extrabold text-[var(--text)]">{title}</h3>
              <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <ModelStatusIndicator status={modelStatus} />

      <section className="glass-panel rounded-[10px] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="section-label">
              Launch CTA
            </p>
            <h2 className="page-title text-[20px]">
              Start with NCAA for free, then unlock the full platform.
            </h2>
            <p className="max-w-3xl text-[13px] leading-5 text-[var(--muted)]">
              Dive into March Madness tools now, then move into Pro when you want the broader multi-sport board.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
              <Link
                href="/ncaa"
                className="primary-button px-4 py-2.5"
              >
                Explore NCAA for Free
              </Link>
              <Link
                href="/pricing"
                className="ghost-button px-4 py-2.5"
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
