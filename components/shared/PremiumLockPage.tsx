type PremiumLockPageProps = {
  sport: string;
  tableTitle: string;
  cardTitles: string[];
  trendTitle: string;
};

function MockStatCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <div className="mt-4 space-y-3">
        <div className="h-3 w-24 rounded-full bg-slate-800" />
        <div className="h-9 rounded-xl bg-slate-900" />
        <div className="h-9 rounded-xl bg-slate-900" />
      </div>
    </div>
  );
}

export function PremiumLockPage({
  sport,
  tableTitle,
  cardTitles,
  trendTitle,
}: PremiumLockPageProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-950/70">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#38bdf822_0%,transparent_40%)]" />
      <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <div className="space-y-6 blur-[2.5px]">
          <section className="grid gap-4 lg:grid-cols-3">
            {cardTitles.map((title) => (
              <MockStatCard key={title} title={title} />
            ))}
          </section>
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {sport} rankings
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{tableTitle}</h2>
              </div>
              <div className="h-9 w-40 rounded-xl bg-slate-900" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/90">
                  <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Team</th>
                    <th className="px-4 py-3 text-left">Rating</th>
                    <th className="px-4 py-3 text-left">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {sport} Team {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {(88.5 - index * 1.7).toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {index < 3 ? "Watch" : "Neutral"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6 blur-[2.5px]">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Futures
            </p>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-3 w-24 rounded-full bg-slate-800" />
                      <div className="mt-2 h-3 w-14 rounded-full bg-slate-900" />
                    </div>
                    <div className="h-7 w-16 rounded-full bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Trends
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">{trendTitle}</h3>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div className="h-3 w-20 rounded-full bg-slate-800" />
                  <div className="mt-3 h-8 rounded-xl bg-slate-900" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[5px]" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-[28px] border border-slate-700 bg-slate-950/95 p-8 text-center shadow-2xl shadow-slate-950/40">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-300">
            Pro Members Only
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {sport} premium analytics
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Advanced analytics, matchup tools, betting models, and premium
            content for this sport are available to Pro members.
          </p>
          <button
            type="button"
            className="mt-6 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
