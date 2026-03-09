import type { Game, Team } from "@/lib/types";

type MatchupSelectorProps = {
  teams: Team[];
  games: Game[];
};

export function MatchupSelector({ teams, games }: MatchupSelectorProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-2">
        <label
          htmlFor="team-a"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
        >
          Team A
        </label>
        <select
          id="team-a"
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400"
          defaultValue={teams[0]?.id}
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
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-400"
          defaultValue={teams[1]?.id}
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Featured matchup
        </p>
        <p className="mt-2 text-sm font-semibold text-white">
          {games[0]?.awayTeam} at {games[0]?.homeTeam}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {games[0]?.tipoff} • {games[0]?.round}
        </p>
      </div>
    </div>
  );
}
