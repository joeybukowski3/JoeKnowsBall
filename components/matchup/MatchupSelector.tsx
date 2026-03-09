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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            Compare mode
          </p>
          <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <button
              type="button"
              onClick={() => onModeChange("upcoming")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "upcoming"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Upcoming Matchups
            </button>
            <button
              type="button"
              onClick={() => onModeChange("manual")}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "manual"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Manual Compare
            </button>
          </div>
        </div>

        <div className="w-full max-w-[320px]">
          <PresetSelector
            presets={presets}
            value={presetId}
            onChange={onPresetChange}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
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
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.awayTeam} at {game.homeTeam} - {game.startTime}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Scheduled games populate both teams automatically.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
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
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/40"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
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
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/40"
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
