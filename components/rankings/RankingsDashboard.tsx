"use client";

import { useMemo, useState } from "react";
import { ChampionProbabilities } from "@/components/insights/ChampionProbabilities";
import { EasiestPaths } from "@/components/insights/EasiestPaths";
import { FuturesValueWatch } from "@/components/insights/FuturesValueWatch";
import { InsightSection } from "@/components/insights/InsightSection";
import { TopValuePlays } from "@/components/insights/TopValuePlays";
import { UpsetWatch } from "@/components/insights/UpsetWatch";
import { RankingsControls } from "@/components/rankings/RankingsControls";
import {
  RankingsTable,
  type RankingsSortKey,
  type RankingsSortState,
} from "@/components/rankings/RankingsTable";
import { Badge } from "@/components/shared/Badge";
import { ModelStatusIndicator } from "@/components/shared/ModelStatusIndicator";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { TeamChip } from "@/components/shared/TeamChip";
import { rankingCategories } from "@/lib/data";
import type {
  BracketGameNode,
  DataSource,
  FuturesMarket,
  FuturesValueRow,
  Game,
  GameValueRow,
  RankingPreset,
  RankingResultRow,
  RankingSettings,
  Team,
} from "@/lib/types";
import {
  buildChampionProbabilities,
  buildEasiestPaths,
  buildFuturesValueWatch,
  buildTopValuePlays,
  buildUpsetWatch,
} from "@/lib/utils/insightBuilders";
import { buildModelStatusSummary } from "@/lib/utils/modelStatus";
import { matchupEngine } from "@/lib/utils/matchupEngine";
import { americanToImpliedProbability } from "@/lib/utils/oddsCalculator";
import { pathDifficulty } from "@/lib/utils/pathDifficulty";
import { rankingsEngine } from "@/lib/utils/rankingsEngine";
import { getStatsStatus } from "@/lib/utils/statAvailability";
import {
  buildBracketRankingRows,
  getUpsetRisk,
  tournamentSimulator,
} from "@/lib/utils/tournamentSimulator";
import { matchTeamName } from "@/lib/utils/teamMatcher";
import { getSpreadValueTier, getValueTier } from "@/lib/utils/valueRatings";

type RankingsDashboardProps = {
  teams: Team[];
  bracketTeams: Team[];
  presets: RankingPreset[];
  futuresMarkets: FuturesMarket[];
  games: Game[];
  bracketGames: BracketGameNode[];
  dataSource?: DataSource;
  tournamentTeamIds?: string[];
};

type TeamView = "all" | "tournament";

function clonePresetSettings(preset: RankingPreset): RankingSettings {
  return {
    presetId: preset.id,
    activeCategories: { ...preset.activeCategories },
    weights: { ...preset.weights },
  };
}

function sortRows(rows: RankingResultRow[], sort: RankingsSortState) {
  const sorted = [...rows];
  sorted.sort((left, right) => {
    const direction = sort.direction === "asc" ? 1 : -1;
    switch (sort.key) {
      case "rank":
        return (left.rank - right.rank) * direction;
      case "team":
        return left.team.name.localeCompare(right.team.name) * direction;
      case "conference":
        return left.team.conference.localeCompare(right.team.conference) * direction;
      case "overallScore":
        return (left.overallScore - right.overallScore) * direction;
      case "offense":
      case "defense":
      case "shooting":
      case "rebounding":
      case "sos":
      case "recentForm":
        return (left.categoryScores[sort.key].raw - right.categoryScores[sort.key].raw) * direction;
      case "valueLabel":
        return (left.valueScore - right.valueScore) * direction;
      default:
        return 0;
    }
  });
  return sorted;
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
  return tierScore(moneylineTier) >= tierScore(spreadTier) ? moneylineTier : spreadTier;
}

function getFallbackTitleProbability(rank: number, pathDifficultyScore: number) {
  const baseline = Math.max(0.012, 0.19 - rank * 0.012);
  const pathPenalty = pathDifficultyScore * 0.0008;
  return Math.max(0.005, baseline - pathPenalty);
}

export function RankingsDashboard({
  teams,
  bracketTeams,
  presets,
  futuresMarkets,
  games,
  bracketGames,
  dataSource = "mock",
  tournamentTeamIds = [],
}: RankingsDashboardProps) {
  const [teamView, setTeamView] = useState<TeamView>("all");
  const [settings, setSettings] = useState<RankingSettings>(() =>
    clonePresetSettings(presets[0]),
  );
  const [sort, setSort] = useState<RankingsSortState>({
    key: "overallScore",
    direction: "desc",
  });

  const selectedPreset = presets.find((preset) => preset.id === settings.presetId) ?? presets[0];
  const statsStatus = getStatsStatus(
    teams
      .map((team) => team.statProfile)
      .filter((profile): profile is NonNullable<Team["statProfile"]> => Boolean(profile)),
  );
  const modelStatus = buildModelStatusSummary({
    teams,
    dataSource,
  });
  const tournamentIdSet = new Set(
    tournamentTeamIds.length > 0
      ? tournamentTeamIds
      : teams.filter((team) => team.isTournamentTeam).map((team) => team.id),
  );
  const filteredTeams =
    teamView === "tournament"
      ? teams.filter((team) => tournamentIdSet.has(team.id))
      : teams;
  const rankedRows = rankingsEngine(filteredTeams, settings, rankingCategories);
  const sortedRows = sortRows(rankedRows, sort);

  const insightData = useMemo(() => {
    const bracketRankingRows = buildBracketRankingRows(bracketTeams, selectedPreset);
    const rankingByName = new Map(bracketRankingRows.map((row) => [row.team.name, row]));
    const pathRows = pathDifficulty(bracketTeams, bracketGames, bracketRankingRows);
    const simulationResult = tournamentSimulator({
      teams: bracketTeams,
      bracketGames,
      preset: selectedPreset,
      iterations: 2500,
    });
    const simulationByName = new Map(
      (simulationResult?.rows ?? []).map((row) => [row.team.name, row]),
    );

    const gameRows = games
      .map((game) => {
        const awayTeam = matchTeamName(game.awayTeam, teams, "ncaa-away").matchedTeam;
        const homeTeam = matchTeamName(game.homeTeam, teams, "ncaa-home").matchedTeam;

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
        const moneylineEdge = summary.teamA.winProbability - impliedWinProbability;
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
          matchup: `${awayTeam.name} at ${homeTeam.name}`,
          sportsbookSpread,
          modelSpread,
          spreadEdge,
          sportsbookMoneyline,
          modelWinProbability: summary.teamA.winProbability,
          impliedWinProbability,
          moneylineEdge,
          upsetRisk,
          valueTier: strongestTier(getValueTier(moneylineEdge), getSpreadValueTier(spreadEdge)),
        } satisfies GameValueRow;
      })
      .filter((row): row is GameValueRow => Boolean(row));

    const futuresRows = futuresMarkets
      .map((market) => {
        const matchedTeam = matchTeamName(market.team, bracketTeams, "ncaa-futures").matchedTeam;
        const rankRow = matchedTeam ? rankingByName.get(matchedTeam.name) : null;

        if (!matchedTeam || !rankRow) {
          return null;
        }

        const pathRow = pathRows.find((row) => row.team.id === matchedTeam.id);
        const simulationRow = simulationByName.get(matchedTeam.name);
        const impliedTitleProbability = americanToImpliedProbability(market.titleOdds);
        const modelTitleProbability =
          simulationRow?.champion ??
          getFallbackTitleProbability(rankRow.rank, pathRow?.pathDifficulty ?? 0);

        return {
          team: matchedTeam,
          rank: rankRow.rank,
          titleOdds: market.titleOdds,
          impliedTitleProbability,
          modelTitleProbability,
          futuresEdge: modelTitleProbability - impliedTitleProbability,
          pathDifficulty: pathRow?.pathDifficulty ?? 0,
          valueTier: getValueTier(modelTitleProbability - impliedTitleProbability),
        } satisfies FuturesValueRow;
      })
      .filter((row): row is FuturesValueRow => Boolean(row));

    return {
      topValuePlays: buildTopValuePlays(gameRows, 3),
      upsetWatch: buildUpsetWatch(gameRows, 3),
      futuresWatch: buildFuturesValueWatch(futuresRows, 3),
      championProbabilities: buildChampionProbabilities(simulationResult, 3),
      easiestPaths: buildEasiestPaths(pathRows, 3),
    };
  }, [bracketGames, bracketTeams, futuresMarkets, games, selectedPreset, teams]);

  function handlePresetChange(presetId: string) {
    const nextPreset = presets.find((preset) => preset.id === presetId);
    if (!nextPreset) {
      return;
    }

    setSettings(clonePresetSettings(nextPreset));
    setSort({ key: "overallScore", direction: "desc" });
  }

  function handleCategoryToggle(category: keyof RankingSettings["activeCategories"]) {
    setSettings((current) => ({
      ...current,
      activeCategories: {
        ...current.activeCategories,
        [category]: !current.activeCategories[category],
      },
    }));
  }

  function handleWeightChange(category: keyof RankingSettings["weights"], value: number) {
    setSettings((current) => ({
      ...current,
      weights: {
        ...current.weights,
        [category]: value,
      },
    }));
  }

  function handleSort(nextKey: RankingsSortKey) {
    setSort((current) => ({
      key: nextKey,
      direction:
        current.key === nextKey && current.direction === "desc" ? "asc" : "desc",
    }));
  }

  function handleReset() {
    setSettings(clonePresetSettings(selectedPreset));
    setSort({ key: "overallScore", direction: "desc" });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
        <div className="space-y-6">
          <PageHeader
            eyebrow="NCAA Analytics"
            title="March betting intelligence and power rankings"
            description="Custom rankings, tournament-field filtering, futures watchlists, and matchup context in a brighter premium NCAA dashboard."
          >
            <div className="flex flex-col items-end gap-3">
              <Badge tone={dataSource === "live" ? "emerald" : "amber"}>
                {dataSource === "live" ? "Live Data" : "Mock Data Fallback"}
              </Badge>
              <Badge
                tone={
                  statsStatus === "Live Stats"
                    ? "emerald"
                    : statsStatus === "Partial Fallback"
                      ? "amber"
                      : "neutral"
                }
              >
                {statsStatus}
              </Badge>
              <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.05] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <button type="button" onClick={() => setTeamView("all")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${teamView === "all" ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/[0.05] hover:text-white"}`}>All Teams</button>
                <button type="button" onClick={() => setTeamView("tournament")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${teamView === "tournament" ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/[0.05] hover:text-white"}`}>NCAA Tournament Field</button>
              </div>
            </div>
          </PageHeader>

          <RankingsControls
            categories={rankingCategories}
            presets={presets}
            settings={settings}
            selectedPreset={selectedPreset}
            onPresetChange={handlePresetChange}
            onCategoryToggle={handleCategoryToggle}
            onWeightChange={handleWeightChange}
            onReset={handleReset}
          />

          <Panel
            eyebrow="Power Ratings"
            title={`${filteredTeams.length} teams in the model`}
            description="Overall score updates immediately as categories are toggled and weighted."
          >
            <RankingsTable rows={sortedRows} sort={sort} onSort={handleSort} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            eyebrow="Futures Watch"
            title="Top title prices"
            description="Quick premium-style monitor for current title prices and top internal edges."
          >
            <div className="space-y-3">
              {insightData.futuresWatch.map((entry) => (
                <div
                  key={entry.team.id}
                  className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <TeamChip name={entry.team.name} subtitle={entry.team.conference} compact />
                    <Badge tone="emerald">{(entry.futuresEdge * 100).toFixed(1)}%</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>Model title probability</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-medium text-white">
                      {(entry.modelTitleProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            eyebrow="Schedule"
            title="Upcoming Matchups"
            description="Snapshot of the current NCAA slate with venue context and rotation-friendly scanability."
          >
            <div className="space-y-3">
              {games.slice(0, 4).map((game) => (
                <div key={game.id} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{game.awayTeam} at {game.homeTeam}</p>
                      <p className="text-xs text-slate-400">{game.startTime} - {game.round}</p>
                    </div>
                    <Badge tone="sky">{game.neutralSite ? "Neutral" : "Campus"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <InsightSection
        eyebrow="NCAA Insights"
        title="Model-driven NCAA content"
        description="The current preset powers these quick-hit value, futures, upset, and tournament outlook modules."
      >
        <div className="space-y-6">
          <TopValuePlays rows={insightData.topValuePlays} />
          <UpsetWatch games={insightData.upsetWatch} />
          <FuturesValueWatch rows={insightData.futuresWatch} />
          <ChampionProbabilities rows={insightData.championProbabilities} />
          <EasiestPaths rows={insightData.easiestPaths} />
        </div>
      </InsightSection>

      <ModelStatusIndicator status={modelStatus} />
    </div>
  );
}
