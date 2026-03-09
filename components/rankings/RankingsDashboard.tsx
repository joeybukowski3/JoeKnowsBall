"use client";

import { useState } from "react";
import { RankingsControls } from "@/components/rankings/RankingsControls";
import {
  RankingsTable,
  type RankingsSortKey,
  type RankingsSortState,
} from "@/components/rankings/RankingsTable";
import { Panel } from "@/components/shared/Panel";
import { rankingCategories } from "@/lib/data";
import type {
  Game,
  Odds,
  RankingPreset,
  RankingResultRow,
  RankingSettings,
  Team,
} from "@/lib/types";
import { rankingsEngine } from "@/lib/utils/rankingsEngine";

type RankingsDashboardProps = {
  teams: Team[];
  presets: RankingPreset[];
  odds: Odds[];
  games: Game[];
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
        return (
          left.categoryScores[sort.key].raw - right.categoryScores[sort.key].raw
        ) * direction;
      case "valueLabel":
        return (left.valueScore - right.valueScore) * direction;
      default:
        return 0;
    }
  });

  return sorted;
}

export function RankingsDashboard({
  teams,
  presets,
  odds,
  games,
}: RankingsDashboardProps) {
  const [teamView, setTeamView] = useState<TeamView>("all");
  const [settings, setSettings] = useState<RankingSettings>(() =>
    clonePresetSettings(presets[0]),
  );
  const [sort, setSort] = useState<RankingsSortState>({
    key: "overallScore",
    direction: "desc",
  });

  const selectedPreset =
    presets.find((preset) => preset.id === settings.presetId) ?? presets[0];
  const filteredTeams =
    teamView === "tournament"
      ? teams.filter((team) => team.isTournamentTeam)
      : teams;
  const rankedRows = rankingsEngine(filteredTeams, settings, rankingCategories);
  const sortedRows = sortRows(rankedRows, sort);
  const futuresOdds = odds.filter((entry) => entry.market === "Futures").slice(0, 5);
  const upcomingGames = games.slice(0, 4);

  function handlePresetChange(presetId: string) {
    const nextPreset = presets.find((preset) => preset.id === presetId);

    if (!nextPreset) {
      return;
    }

    setSettings(clonePresetSettings(nextPreset));
    setSort({
      key: "overallScore",
      direction: "desc",
    });
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

  function handleWeightChange(
    category: keyof RankingSettings["weights"],
    value: number,
  ) {
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
    setSort({
      key: "overallScore",
      direction: "desc",
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                Rankings Dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                NCAA men&apos;s basketball power rankings
              </h1>
              <p className="max-w-2xl text-sm text-slate-400">
                Interactive mock rankings engine with preset models, category
                toggles, custom weights, and sortable output.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
              <button
                type="button"
                onClick={() => setTeamView("all")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  teamView === "all"
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                All Teams
              </button>
              <button
                type="button"
                onClick={() => setTeamView("tournament")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  teamView === "tournament"
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                NCAA Tournament Field
              </button>
            </div>
          </div>

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
        </section>

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
          eyebrow="Market Watch"
          title="Futures Value Watch"
          description="Simple placeholder watchlist tied to current mock prices."
        >
          <div className="space-y-3">
            {futuresOdds.map((entry) => {
              const edge = (entry.modelProbability - entry.impliedProbability) * 100;

              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {entry.team}
                      </p>
                      <p className="text-xs text-slate-400">{entry.book}</p>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                      {entry.price > 0 ? `+${entry.price}` : entry.price}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Model edge</span>
                    <span className="font-medium text-white">{edge.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          eyebrow="Schedule"
          title="Upcoming Matchups"
          description="Quick-look mock slate for the next set of games."
        >
          <div className="space-y-3">
            {upcomingGames.map((game) => (
              <div
                key={game.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {game.awayTeam} at {game.homeTeam}
                    </p>
                    <p className="text-xs text-slate-400">
                      {game.startTime} • {game.round}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-sky-300">
                    {game.neutralSite ? "Neutral" : "Campus"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
