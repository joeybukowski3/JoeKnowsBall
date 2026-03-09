import { RankingsControls } from "@/components/rankings/RankingsControls";
import { RankingsTable } from "@/components/rankings/RankingsTable";
import { Panel } from "@/components/shared/Panel";
import { games, odds, presets, teams } from "@/lib/data";

const upcomingGames = games.slice(0, 4);
const futuresOdds = odds.filter((entry) => entry.market === "Futures").slice(0, 5);

export default function HomePage() {
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
                Placeholder rankings and controls for modeling team quality,
                tournament outlook, and betting value.
              </p>
            </div>
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
              <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950">
                All Teams
              </button>
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300">
                NCAA Tournament Field
              </button>
            </div>
          </div>
          <RankingsControls presets={presets} />
        </section>

        <Panel
          eyebrow="Power Ratings"
          title="Current rankings"
          description="Mock table-first layout for custom presets, stat weighting, and team comparisons."
        >
          <RankingsTable teams={teams} />
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel
          eyebrow="Market Watch"
          title="Futures value"
          description="Placeholder pricing tiles for conference, Final Four, and title markets."
        >
          <div className="space-y-3">
            {futuresOdds.map((entry) => (
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
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          eyebrow="Schedule"
          title="Upcoming matchups"
          description="Quick-look games panel for the next slate."
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
                      {game.tipoff} • {game.round}
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
