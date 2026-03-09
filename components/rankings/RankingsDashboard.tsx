"use client";

import { useState } from "react";
import { RankingsControls } from "@/components/rankings/RankingsControls";
import { RankingsTable, type RankingsSortKey, type RankingsSortState } from "@/components/rankings/RankingsTable";
import { Badge } from "@/components/shared/Badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { TeamChip } from "@/components/shared/TeamChip";
import { rankingCategories } from "@/lib/data";
import type { Game, Odds, RankingPreset, RankingResultRow, RankingSettings, Team } from "@/lib/types";
import { rankingsEngine } from "@/lib/utils/rankingsEngine";

type RankingsDashboardProps = {
  teams: Team[];
  presets: RankingPreset[];
  odds: Odds[];
  games: Game[];
};

type TeamView = "all" | "tournament";

function clonePresetSettings(preset: RankingPreset): RankingSettings {
  return { presetId: preset.id, activeCategories: { ...preset.activeCategories }, weights: { ...preset.weights } };
}

function sortRows(rows: RankingResultRow[], sort: RankingsSortState) {
  const sorted = [...rows];
  sorted.sort((left, right) => {
    const direction = sort.direction === "asc" ? 1 : -1;
    switch (sort.key) {
      case "rank": return (left.rank - right.rank) * direction;
      case "team": return left.team.name.localeCompare(right.team.name) * direction;
      case "conference": return left.team.conference.localeCompare(right.team.conference) * direction;
      case "overallScore": return (left.overallScore - right.overallScore) * direction;
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

export function RankingsDashboard({ teams, presets, odds, games }: RankingsDashboardProps) {
  const [teamView, setTeamView] = useState<TeamView>("all");
  const [settings, setSettings] = useState<RankingSettings>(() => clonePresetSettings(presets[0]));
  const [sort, setSort] = useState<RankingsSortState>({ key: "overallScore", direction: "desc" });

  const selectedPreset = presets.find((preset) => preset.id === settings.presetId) ?? presets[0];
  const filteredTeams = teamView === "tournament" ? teams.filter((team) => team.isTournamentTeam) : teams;
  const rankedRows = rankingsEngine(filteredTeams, settings, rankingCategories);
  const sortedRows = sortRows(rankedRows, sort);
  const futuresOdds = odds.filter((entry) => entry.market === "Futures").slice(0, 5);
  const upcomingGames = games.slice(0, 4);

  function handlePresetChange(presetId: string) {
    const nextPreset = presets.find((preset) => preset.id === presetId);
    if (!nextPreset) return;
    setSettings(clonePresetSettings(nextPreset));
    setSort({ key: "overallScore", direction: "desc" });
  }

  function handleCategoryToggle(category: keyof RankingSettings["activeCategories"]) {
    setSettings((current) => ({ ...current, activeCategories: { ...current.activeCategories, [category]: !current.activeCategories[category] } }));
  }

  function handleWeightChange(category: keyof RankingSettings["weights"], value: number) {
    setSettings((current) => ({ ...current, weights: { ...current.weights, [category]: value } }));
  }

  function handleSort(nextKey: RankingsSortKey) {
    setSort((current) => ({ key: nextKey, direction: current.key === nextKey && current.direction === "desc" ? "asc" : "desc" }));
  }

  function handleReset() {
    setSettings(clonePresetSettings(selectedPreset));
    setSort({ key: "overallScore", direction: "desc" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
      <div className="space-y-6">
        <PageHeader
          eyebrow="NCAA Analytics"
          title="March betting intelligence and power rankings"
          description="Custom rankings, tournament-field filtering, futures watchlists, and matchup context in a brighter premium NCAA dashboard."
        >
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.05] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <button type="button" onClick={() => setTeamView("all")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${teamView === "all" ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/[0.05] hover:text-white"}`}>All Teams</button>
            <button type="button" onClick={() => setTeamView("tournament")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${teamView === "tournament" ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/[0.05] hover:text-white"}`}>NCAA Tournament Field</button>
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

        <Panel eyebrow="Power Ratings" title={`${filteredTeams.length} teams in the model`} description="Overall score updates immediately as categories are toggled and weighted.">
          <RankingsTable rows={sortedRows} sort={sort} onSort={handleSort} />
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel eyebrow="Market Watch" title="Futures Value Watch" description="Quick premium-style monitor for current title prices and top internal edges.">
          <div className="space-y-3">
            {futuresOdds.map((entry) => {
              const edge = (entry.modelProbability - entry.impliedProbability) * 100;
              return (
                <div key={entry.id} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <TeamChip name={entry.team} subtitle={entry.book} compact />
                    <Badge tone="emerald">{entry.price > 0 ? `+${entry.price}` : entry.price}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>Model edge</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-medium text-white">{edge.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel eyebrow="Schedule" title="Upcoming Matchups" description="Snapshot of the current NCAA slate with venue context and rotation-friendly scanability.">
          <div className="space-y-3">
            {upcomingGames.map((game) => (
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
  );
}
