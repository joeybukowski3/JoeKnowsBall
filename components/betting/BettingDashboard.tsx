"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BettingControls } from "@/components/betting/BettingControls";
import { BettingSummaryPanel } from "@/components/betting/BettingSummaryPanel";
import { FuturesValueWatch } from "@/components/insights/FuturesValueWatch";
import { InsightCard } from "@/components/insights/InsightCard";
import { InsightSection } from "@/components/insights/InsightSection";
import { TopValuePlays } from "@/components/insights/TopValuePlays";
import { UpsetWatch } from "@/components/insights/UpsetWatch";
import {
  FuturesValueTable,
  type FuturesSortKey,
} from "@/components/betting/FuturesValueTable";
import { GameValueTable } from "@/components/betting/GameValueTable";
import { Badge } from "@/components/shared/Badge";
import { ModelStatusIndicator } from "@/components/shared/ModelStatusIndicator";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import type {
  DataSource,
  FuturesMarket,
  FuturesValueRow,
  Game,
  GameValueRow,
  RankingPreset,
  Team,
  TournamentSimulationResult,
} from "@/lib/types";
import { buildBestBetsSnapshot } from "@/lib/utils/bestBets";
import { matchupEngine } from "@/lib/utils/matchupEngine";
import {
  americanToImpliedProbability,
  formatAmericanOdds,
} from "@/lib/utils/oddsCalculator";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import {
  buildBracketRankingRows,
  getUpsetRisk,
  tournamentSimulator,
} from "@/lib/utils/tournamentSimulator";
import { matchTeamName } from "@/lib/utils/teamMatcher";
import { getSpreadValueTier, getValueTier } from "@/lib/utils/valueRatings";
import {
  buildFuturesValueWatch,
  buildTopSpreadEdges,
  buildTopValuePlays,
  buildUpsetWatch,
} from "@/lib/utils/insightBuilders";
import { buildModelStatusSummary } from "@/lib/utils/modelStatus";

type BettingDashboardProps = {
  teams: Team[];
  bracketTeams: Team[];
  games: Game[];
  presets: RankingPreset[];
  futuresMarkets: FuturesMarket[];
  bracketGames: import("@/lib/types").BracketGameNode[];
  dataSource?: DataSource;
};

type GameSortOption = "edge" | "winProbability" | "closest" | "upsetRisk";

function getDateLabel(startTime: string) {
  return startTime.split(",")[0]?.trim() ?? startTime;
}

function tierScore(tier: GameValueRow["valueTier"]) {
  switch (tier) {
    case "Strong":
      return 4;
    case "Medium":
      return 3;
    case "Small":
      return 2;
    default:
      return 1;
  }
}

function strongestTier(
  moneylineTier: GameValueRow["valueTier"],
  spreadTier: GameValueRow["valueTier"],
): GameValueRow["valueTier"] {
  return tierScore(moneylineTier) >= tierScore(spreadTier)
    ? moneylineTier
    : spreadTier;
}

function upsetRiskScore(risk: GameValueRow["upsetRisk"]) {
  switch (risk) {
    case "High":
      return 4;
    case "Medium":
      return 3;
    case "Toss-Up":
      return 2;
    default:
      return 1;
  }
}

function getFallbackTitleProbability(rank: number, pathDifficultyScore: number) {
  const baseline = Math.max(0.012, 0.19 - rank * 0.012);
  const pathPenalty = pathDifficultyScore * 0.0008;
  return Math.max(0.005, baseline - pathPenalty);
}

export function BettingDashboard({
  teams,
  bracketTeams,
  games,
  presets,
  futuresMarkets,
  bracketGames,
  dataSource = "mock",
}: BettingDashboardProps) {
  const [presetId, setPresetId] = useState(presets[0]?.id ?? "");
  const [dateFilter, setDateFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState<"all" | "top">("all");
  const [gameSort, setGameSort] = useState<GameSortOption>("edge");
  const [futuresSort, setFuturesSort] = useState<FuturesSortKey>("futuresEdge");
  const [futuresSortDirection, setFuturesSortDirection] = useState<"asc" | "desc">("desc");

  const selectedPreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
  const dateOptions = Array.from(new Set(games.map((game) => getDateLabel(game.startTime))));
  const simulationResult = useMemo<TournamentSimulationResult>(
    () =>
      tournamentSimulator({
        teams: bracketTeams,
        bracketGames,
        preset: selectedPreset,
        iterations: 3000,
      }),
    [bracketGames, bracketTeams, selectedPreset],
  );
  const bracketRankingRows = buildBracketRankingRows(bracketTeams, selectedPreset);
  const rankingByName = new Map(bracketRankingRows.map((row) => [row.team.name, row]));
  const pathRows = pathDifficulty(bracketTeams, bracketGames, bracketRankingRows);
  const pathByName = new Map(pathRows.map((row) => [row.team.name, row]));
  const simulationByName = new Map(
    (simulationResult?.rows ?? []).map((row) => [row.team.name, row]),
  );

  const gameRows = games
    .map((game) => {
      const awayTeam = matchTeamName(game.awayTeam, teams, "betting-away").matchedTeam;
      const homeTeam = matchTeamName(game.homeTeam, teams, "betting-home").matchedTeam;

      if (!awayTeam || !homeTeam) {
        return null;
      }

      const summary = matchupEngine({
        allTeams: teams,
        teamA: awayTeam,
        teamB: homeTeam,
        preset: selectedPreset,
        game,
      });
      const sportsbookSpread = -game.spread;
      const modelSpread = summary.modelSpread;
      const spreadEdge = Number((modelSpread - sportsbookSpread).toFixed(1));
      const sportsbookMoneyline = game.moneylineAway;
      const impliedWinProbability = americanToImpliedProbability(sportsbookMoneyline);
      const modelWinProbability = summary.teamA.winProbability;
      const moneylineEdge = modelWinProbability - impliedWinProbability;
      const moneylineTier = getValueTier(moneylineEdge);
      const spreadTier = getSpreadValueTier(spreadEdge);
      const upsetRisk = getUpsetRisk(
        {
          team: awayTeam,
          seed: awayTeam.seed ? Number(awayTeam.seed) : null,
          modelScore: summary.teamA.overallScore,
          rank: summary.teamA.rank,
          winProbability: summary.teamA.winProbability,
        },
        {
          team: homeTeam,
          seed: homeTeam.seed ? Number(homeTeam.seed) : null,
          modelScore: summary.teamB.overallScore,
          rank: summary.teamB.rank,
          winProbability: summary.teamB.winProbability,
        },
      );

      return {
        game,
        awayTeam,
        homeTeam,
        matchup: `${game.awayTeam} at ${game.homeTeam}`,
        sportsbookSpread,
        modelSpread,
        spreadEdge,
        sportsbookMoneyline,
        modelWinProbability,
        impliedWinProbability,
        moneylineEdge,
        upsetRisk,
        valueTier: strongestTier(moneylineTier, spreadTier),
      } satisfies GameValueRow;
    })
    .filter((row): row is GameValueRow => Boolean(row));

  const filteredGameRows = gameRows
    .filter((row) => dateFilter === "all" || getDateLabel(row.game.startTime) === dateFilter)
    .filter((row) => (gameFilter === "top" ? tierScore(row.valueTier) >= 3 : true))
    .sort((left, right) => {
      switch (gameSort) {
        case "winProbability":
          return right.modelWinProbability - left.modelWinProbability;
        case "closest":
          return Math.abs(left.modelWinProbability - 0.5) - Math.abs(right.modelWinProbability - 0.5);
        case "upsetRisk":
          return upsetRiskScore(right.upsetRisk) - upsetRiskScore(left.upsetRisk);
        case "edge":
        default:
          return Math.abs(right.moneylineEdge) - Math.abs(left.moneylineEdge);
      }
    });

  const futuresRows = futuresMarkets
    .map((market) => {
      const team = matchTeamName(market.team, bracketTeams, "betting-futures").matchedTeam;
      const rankRow = team ? rankingByName.get(team.name) : null;

      if (!team || !rankRow) {
        return null;
      }

      const impliedTitleProbability = americanToImpliedProbability(market.titleOdds);
      const pathRow = pathByName.get(market.team);
      const simulationRow = simulationByName.get(market.team);
      const modelTitleProbability =
        simulationRow?.champion ??
        getFallbackTitleProbability(rankRow.rank, pathRow?.pathDifficulty ?? 0);
      const futuresEdge = modelTitleProbability - impliedTitleProbability;

      return {
        team,
        rank: rankRow.rank,
        titleOdds: market.titleOdds,
        impliedTitleProbability,
        modelTitleProbability,
        futuresEdge,
        pathDifficulty: pathRow?.pathDifficulty ?? 0,
        valueTier: getValueTier(futuresEdge),
      } satisfies FuturesValueRow;
    })
    .filter((row): row is FuturesValueRow => Boolean(row))
    .sort((left, right) => {
      const direction = futuresSortDirection === "desc" ? -1 : 1;

      switch (futuresSort) {
        case "team":
          return left.team.name.localeCompare(right.team.name) * direction;
        case "rank":
          return (left.rank - right.rank) * direction;
        case "titleOdds":
          return (left.titleOdds - right.titleOdds) * direction;
        case "impliedTitleProbability":
          return (left.impliedTitleProbability - right.impliedTitleProbability) * direction;
        case "modelTitleProbability":
          return (left.modelTitleProbability - right.modelTitleProbability) * direction;
        case "pathDifficulty":
          return (left.pathDifficulty - right.pathDifficulty) * direction;
        case "futuresEdge":
        default:
          return (left.futuresEdge - right.futuresEdge) * direction;
      }
    });

  const strongestMoneyline =
    [...filteredGameRows].sort((left, right) => right.moneylineEdge - left.moneylineEdge)[0] ??
    null;
  const strongestSpread =
    [...filteredGameRows].sort((left, right) => Math.abs(right.spreadEdge) - Math.abs(left.spreadEdge))[0] ??
    null;
  const bestFutures =
    [...futuresRows].sort((left, right) => right.futuresEdge - left.futuresEdge)[0] ?? null;
  const mostUpsetProne =
    [...filteredGameRows].sort((left, right) => upsetRiskScore(right.upsetRisk) - upsetRiskScore(left.upsetRisk))[0] ??
    null;
  const averageEdge =
    filteredGameRows.length > 0
      ? filteredGameRows.reduce((sum, row) => sum + row.moneylineEdge, 0) /
        filteredGameRows.length
      : 0;
  const topValuePlays = buildTopValuePlays(filteredGameRows, 5);
  const topSpreadPlays = buildTopSpreadEdges(filteredGameRows, 1);
  const upsetWatch = buildUpsetWatch(filteredGameRows, 5);
  const topFutures = buildFuturesValueWatch(futuresRows, 5);
  const modelStatus = buildModelStatusSummary({
    teams,
    dataSource,
  });
  const bestBetsSnapshot = useMemo(
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

  function handleFuturesSort(key: FuturesSortKey) {
    if (futuresSort === key) {
      setFuturesSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setFuturesSort(key);
    setFuturesSortDirection("desc");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Betting Analytics"
        title="NCAA game value and futures dashboard"
        description="Premium-style betting workflow built from internal power ratings, matchup logic, sportsbook lines, and tournament simulation outputs."
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone={dataSource === "live" ? "emerald" : "amber"}>
            {dataSource === "live" ? "Live Data" : "Mock Data Fallback"}
          </Badge>
          <Link
            href="/betting/best-bets"
            className="ghost-button px-4 py-2 text-xs uppercase tracking-[0.18em]"
          >
            Best Bets Today
          </Link>
        </div>
      </PageHeader>

      <BettingControls
        presets={presets}
        presetId={selectedPreset.id}
        dateOptions={dateOptions}
        dateFilter={dateFilter}
        gameFilter={gameFilter}
        sortBy={gameSort}
        onPresetChange={setPresetId}
        onDateFilterChange={setDateFilter}
        onGameFilterChange={setGameFilter}
        onSortChange={setGameSort}
      />

      <InsightSection
        eyebrow="Betting Insights"
        title="Today's strongest model angles"
        description="Fast-turn betting content pulled directly from the current preset, market lines, and futures model."
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InsightCard
              eyebrow="Moneyline"
              title={strongestMoneyline?.matchup ?? "No edge"}
              value={
                strongestMoneyline
                  ? `${(strongestMoneyline.moneylineEdge * 100).toFixed(1)}%`
                  : "--"
              }
              tone="emerald"
              description="Strongest moneyline edge on the filtered slate."
            />
            <InsightCard
              eyebrow="Spread"
              title={strongestSpread?.matchup ?? "No edge"}
              value={
                strongestSpread ? `${strongestSpread.spreadEdge.toFixed(1)} pts` : "--"
              }
              tone="sky"
              description={`Top spread discrepancy${topSpreadPlays[0] ? ` • ${formatAmericanOdds(topSpreadPlays[0].sportsbookMoneyline)} moneyline` : ""}.`}
            />
            <InsightCard
              eyebrow="Futures"
              title={bestFutures?.team.name ?? "No futures edge"}
              value={bestFutures ? `${(bestFutures.futuresEdge * 100).toFixed(1)}%` : "--"}
              tone="sky"
              description="Best title-futures value after simulation and path adjustments."
            />
            <InsightCard
              eyebrow="Volatility"
              title={mostUpsetProne?.matchup ?? "No hotspot"}
              value={mostUpsetProne?.upsetRisk ?? "--"}
              tone="amber"
              description="Most upset-prone matchup on the board."
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Highest Confidence Plays
              </p>
              <div className="mt-3 space-y-3">
                {bestBetsSnapshot.highestConfidence.slice(0, 3).map((bet) => (
                  <div key={bet.id} className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
                    <p className="text-sm font-semibold text-white">{bet.selection}</p>
                    <p className="mt-1 text-xs text-slate-400">{bet.matchup}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                High Risk / High Reward
              </p>
              <div className="mt-3 space-y-3">
                {bestBetsSnapshot.highRiskReward.slice(0, 3).map((bet) => (
                  <div key={bet.id} className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
                    <p className="text-sm font-semibold text-white">{bet.selection}</p>
                    <p className="mt-1 text-xs text-slate-400">{bet.matchup}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <TopValuePlays rows={topValuePlays} title="Top 5 Value Plays Today" />
          <UpsetWatch games={upsetWatch} title="Most Upset-Prone Matchups" />
          <FuturesValueWatch rows={topFutures} title="Best Futures Value" />
        </div>
      </InsightSection>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <div className="space-y-6">
          <Panel
            eyebrow="Game Value"
            title={`${filteredGameRows.length} games on the slate`}
            description="Model spreads, moneyline edges, upset risk, and value tiers for the current NCAA board."
          >
            <GameValueTable rows={filteredGameRows} />
          </Panel>

          <Panel
            eyebrow="Futures Value"
            title="National title market"
            description="Title edges blend current model rank, path difficulty, and tournament simulation probability."
          >
            <FuturesValueTable
              rows={futuresRows}
              sortKey={futuresSort}
              sortDirection={futuresSortDirection}
              onSort={handleFuturesSort}
            />
          </Panel>
        </div>

        <BettingSummaryPanel
          strongestMoneyline={strongestMoneyline}
          strongestSpread={strongestSpread}
          bestFutures={bestFutures}
          mostUpsetProne={mostUpsetProne}
          averageEdge={averageEdge}
        />
      </div>

      <ModelStatusIndicator status={modelStatus} />
    </div>
  );
}
