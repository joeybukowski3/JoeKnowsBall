import { Badge } from "@/components/shared/Badge";
import { PageHeader } from "@/components/shared/PageHeader";

type PremiumLockPageProps = {
  sport: string;
  tableTitle: string;
  cardTitles: string[];
  trendTitle: string;
};

function MockStatCard({ title, index }: { title: string; index: number }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.68))] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          {title}
        </p>
        <div className="h-8 w-8 rounded-2xl border border-white/10 bg-white/10" />
      </div>
      <div className="mt-4 space-y-3">
        <div
          className="h-2.5 rounded-full"
          style={{
            width: `${60 + index * 8}%`,
            background:
              "linear-gradient(90deg, rgba(125,211,252,0.6), rgba(255,255,255,0.18))",
          }}
        />
        <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-3">
          <div className="h-3 w-24 rounded-full bg-white/12" />
          <div className="mt-3 h-9 rounded-xl bg-white/6" />
        </div>
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
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${sport} Pro`}
        title={`${sport} premium analytics`}
        description="A locked preview of deeper rankings, matchup tools, betting models, futures pricing, and trend dashboards available inside the Pro tier."
      />

      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.9))] shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.72fr)_380px]">
          <div className="space-y-6 blur-[2.2px] saturate-125">
            <section className="grid gap-4 lg:grid-cols-3">
              {cardTitles.map((title, index) => (
                <MockStatCard key={title} title={title} index={index} />
              ))}
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {sport} rankings
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{tableTitle}</h2>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Live board
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/10">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-slate-950/70">
                    <tr className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-4 py-3 text-left">Rank</th>
                      <th className="px-4 py-3 text-left">Team</th>
                      <th className="px-4 py-3 text-left">Rating</th>
                      <th className="px-4 py-3 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 bg-white/[0.03]">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-slate-300">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-white">
                          {sport} Team {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {(90.4 - index * 1.6).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                            {index < 3 ? "Value" : "Neutral"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-6 blur-[2.2px] saturate-125">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Futures market
                </p>
                <Badge tone="emerald">Model blend</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/8 bg-slate-950/55 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-2">
                        <div className="h-3 w-24 rounded-full bg-white/12" />
                        <div className="h-3 w-14 rounded-full bg-white/8" />
                      </div>
                      <div className="h-7 w-16 rounded-full bg-sky-400/20" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Trends
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{trendTitle}</h3>
              <div className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/8 bg-slate-950/55 p-4"
                  >
                    <div className="h-3 w-20 rounded-full bg-white/12" />
                    <div className="mt-3 h-8 rounded-xl bg-white/6" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Matchup center
                </p>
                <Badge tone="amber">Preview</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/8 bg-slate-950/55 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="h-3 w-28 rounded-full bg-white/12" />
                        <div className="mt-2 h-3 w-16 rounded-full bg-white/8" />
                      </div>
                      <div className="h-8 w-20 rounded-2xl bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[7px]" />
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-[30px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(15,23,42,0.95))] p-8 text-center shadow-[0_28px_100px_rgba(15,23,42,0.32)]">
            <Badge tone="sky">Pro Members Only</Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-white">
              {sport} advanced board access
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Advanced analytics, matchup tools, betting models, and premium
              content for this sport are available to Pro members.
            </p>
            <button
              type="button"
              className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
