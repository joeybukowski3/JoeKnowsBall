"use client";

import { useState } from "react";
import { BettingComparison } from "@/components/matchup/BettingComparison";
import { MatchupInsight } from "@/components/matchup/MatchupInsight";
import { MatchupSelector } from "@/components/matchup/MatchupSelector";
import { MatchupSummary } from "@/components/matchup/MatchupSummary";
import { MatchupTable } from "@/components/matchup/MatchupTable";
import { Badge } from "@/components/shared/Badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import type { DataSource, Game, MatchupMode, RankingPreset, Team } from "@/lib/types";
import { matchupEngine } from "@/lib/utils/matchupEngine";
import { matchTeamName } from "@/lib/utils/teamMatcher";

type MatchupDashboardProps = {
  teams: Team[];
  games: Game[];
  presets: RankingPreset[];
  dataSource?: DataSource;
};

function findTeamByName(teams: Team[], name: string) {
  return matchTeamName(name, teams, "matchup-selector").matchedTeam;
}

export function MatchupDashboard({
  teams,
  games,
  presets,
  dataSource = "mock",
}: MatchupDashboardProps) {
  const initialGame = games[0];
  const initialAway = findTeamByName(teams, initialGame.awayTeam) ?? teams[0];
  const initialHome = findTeamByName(teams, initialGame.homeTeam) ?? teams[1];

  const [mode, setMode] = useState<MatchupMode>("upcoming");
  const [selectedGameId, setSelectedGameId] = useState(initialGame.id);
  const [teamAId, setTeamAId] = useState(initialAway.id);
  const [teamBId, setTeamBId] = useState(initialHome.id);
  const [presetId, setPresetId] = useState(presets[0].id);

  const selectedPreset =
    presets.find((preset) => preset.id === presetId) ?? presets[0];
  const selectedGame = games.find((game) => game.id === selectedGameId);
  const teamA = teams.find((team) => team.id === teamAId) ?? teams[0];
  const teamB =
    teams.find((team) => team.id === teamBId) ??
    teams.find((team) => team.id !== teamA.id) ??
    teams[0];
  const activeGame = mode === "upcoming" && selectedGame ? selectedGame : undefined;
  const summary = matchupEngine({
    allTeams: teams,
    teamA,
    teamB,
    preset: selectedPreset,
    game: activeGame,
  });

  function handleModeChange(nextMode: MatchupMode) {
    setMode(nextMode);
  }

  function handleGameChange(gameId: string) {
    const nextGame = games.find((game) => game.id === gameId);

    if (!nextGame) {
      return;
    }

    const awayTeam = findTeamByName(teams, nextGame.awayTeam);
    const homeTeam = findTeamByName(teams, nextGame.homeTeam);

    setSelectedGameId(gameId);
    setMode("upcoming");

    if (awayTeam) {
      setTeamAId(awayTeam.id);
    }

    if (homeTeam) {
      setTeamBId(homeTeam.id);
    }
  }

  function handleTeamChange(teamSlot: "teamA" | "teamB", nextTeamId: string) {
    setMode("manual");

    if (teamSlot === "teamA") {
      setTeamAId(nextTeamId);
      if (nextTeamId === teamBId) {
        const fallback = teams.find((team) => team.id !== nextTeamId);
        if (fallback) {
          setTeamBId(fallback.id);
        }
      }
      return;
    }

    setTeamBId(nextTeamId);
    if (nextTeamId === teamAId) {
      const fallback = teams.find((team) => team.id !== nextTeamId);
      if (fallback) {
        setTeamAId(fallback.id);
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Matchup Model"
        title="Team comparison and matchup calculator"
        description="Compare any two teams through the same preset-driven ratings model powering the NCAA dashboard, then review market context and the biggest category edges."
      >
        <Badge tone={dataSource === "live" ? "emerald" : "amber"}>
          {dataSource === "live" ? "Live Data" : "Mock Data Fallback"}
        </Badge>
      </PageHeader>

      <Panel
        eyebrow="Controls"
        title="Choose a matchup"
        description="Switch between scheduled games and manual compare without leaving the page."
      >
        <MatchupSelector
          mode={mode}
          selectedGameId={selectedGameId}
          teamAId={teamA.id}
          teamBId={teamB.id}
          presetId={selectedPreset.id}
          teams={teams}
          games={games}
          presets={presets}
          onModeChange={handleModeChange}
          onGameChange={handleGameChange}
          onTeamChange={handleTeamChange}
          onPresetChange={setPresetId}
        />
      </Panel>

      <MatchupSummary summary={summary} game={activeGame} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
        <Panel
          eyebrow="Comparison"
          title={`${teamA.name} vs ${teamB.name}`}
          description="Category-by-category edge table using the active preset weights."
        >
          <MatchupTable summary={summary} teamA={teamA} teamB={teamB} />
        </Panel>

        <div className="space-y-6">
          <Panel
            eyebrow="Insight"
            title="What drives the edge"
            description="Deterministic matchup explanation based on the current model output."
          >
            <MatchupInsight summary={summary} />
          </Panel>
        </div>
      </div>

      <Panel
        eyebrow="Betting View"
        title="Market comparison"
        description="Early sportsbook versus model comparison using the current mock lines."
      >
        <BettingComparison summary={summary} game={activeGame} />
      </Panel>
    </div>
  );
}
