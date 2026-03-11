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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="section-label">
            Compare mode
          </p>
          <div className="inline-flex rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-1">
            <button
              type="button"
              onClick={() => onModeChange("upcoming")}
              className={`rounded-[7px] border px-3 py-1.5 text-[13px] font-semibold transition ${
                mode === "upcoming"
                  ? "border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
              }`}
            >
              Upcoming Matchups
            </button>
            <button
              type="button"
              onClick={() => onModeChange("manual")}
              className={`rounded-[7px] border px-3 py-1.5 text-[13px] font-semibold transition ${
                mode === "manual"
                  ? "border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
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

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="surface-card p-3">
          <label
            htmlFor="matchup-game"
            className="section-label"
          >
            Upcoming matchup
          </label>
          <select
            id="matchup-game"
            value={selectedGameId}
            onChange={(event) => onGameChange(event.target.value)}
            disabled={mode !== "upcoming"}
            className="mt-2 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent-mid)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.awayTeam} at {game.homeTeam} - {game.startTime}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-[var(--muted)]">
            Scheduled games populate both teams automatically.
          </p>
        </div>

        <div className="surface-card p-3">
          <label
            htmlFor="team-a"
            className="section-label"
          >
            Team A
          </label>
          <select
            id="team-a"
            value={teamAId}
            onChange={(event) => onTeamChange("teamA", event.target.value)}
            className="mt-2 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent-mid)]"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="surface-card p-3">
          <label
            htmlFor="team-b"
            className="section-label"
          >
            Team B
          </label>
          <select
            id="team-b"
            value={teamBId}
            onChange={(event) => onTeamChange("teamB", event.target.value)}
            className="mt-2 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent-mid)]"
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
