import { MatchupSelector } from "@/components/matchup/MatchupSelector";
import { MatchupTable } from "@/components/matchup/MatchupTable";
import { Panel } from "@/components/shared/Panel";
import { games, teams } from "@/lib/data";

export default function MatchupPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
          Matchup Model
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Team-vs-team scouting table
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Starter layout for selecting two teams, comparing key metrics, and
          layering in simulation logic later.
        </p>
      </section>

      <Panel
        eyebrow="Controls"
        title="Select a matchup"
        description="Mock selector wired to placeholder data."
      >
        <MatchupSelector teams={teams} games={games} />
      </Panel>

      <Panel
        eyebrow="Comparison"
        title="Side-by-side team profile"
        description="Foundational comparison table for efficiency, tempo, rebounding, and shot quality."
      >
        <MatchupTable teams={teams.slice(0, 2)} />
      </Panel>
    </div>
  );
}
