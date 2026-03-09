"use client";

import { PresetSelector } from "@/components/shared/PresetSelector";
import type { Game, MatchupMode, RankingPreset, Team } from "@/lib/types";

type MatchupSelectorProps = {
  mode: MatchupMode;
  selectedGameId: string;
  teamAId: string;
  teamBId: string;
  presetId: string;
  teams: Team[];
  games: Game[];
  presets: RankingPreset[];
  onModeChange: (mode: MatchupMode) => void;
  onGameChange: (gameId: string) => void;
  onTeamChange: (teamSlot: "teamA" | "teamB", teamId: string) => void;
  onPresetChange: (presetId: string) => void;
};

export function MatchupSelector({
  mode,
  selectedGameId,
  teamAId,
  teamBId,
  presetId,
  teams,
  games,
  presets,
  onModeChange,
  onGameChange,
  onTeamChange,
  onPresetChange,
}: MatchupSelectorProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          <button
            type="button"
            onClick={() => onModeChange("upcoming")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "upcoming"
                ? "bg-slate-100 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Upcoming Matchups
          </button>
          <button
            type="button"
            onClick={() => onModeChange("manual")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "manual"
                ? "bg-slate-100 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Manual Compare
          </button>
        </div>

        <div className="w-full max-w-[280px]">
          <PresetSelector
            presets={presets}
            value={presetId}
            onChange={onPresetChange}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <label
            htmlFor="matchup-game"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Upcoming matchup
          </label>
          <select
            id="matchup-game"
            value={selectedGameId}
            onChange={(event) => onGameChange(event.target.value)}
            disabled={mode !== "upcoming"}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.awayTeam} at {game.homeTeam} • {game.startTime}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="team-a"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Team A
          </label>
          <select
            id="team-a"
            value={teamAId}
            onChange={(event) => onTeamChange("teamA", event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="team-b"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Team B
          </label>
          <select
            id="team-b"
            value={teamBId}
            onChange={(event) => onTeamChange("teamB", event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
