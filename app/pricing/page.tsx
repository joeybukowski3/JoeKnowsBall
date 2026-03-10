import Link from "next/link";
import { Badge } from "@/components/shared/Badge";
import { PageHeader } from "@/components/shared/PageHeader";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pricing"
        title="Simple access for March and beyond"
        description="NCAA tournament tools are free during launch. Pro opens the broader multi-sport analytics board with deeper premium workflows."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(15,23,42,0.36))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">NCAA Free Access</h2>
            <Badge tone="emerald">Live now</Badge>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Access the NCAA rankings dashboard, matchup tool, bracket builder,
            tournament simulation, and betting value screens during launch.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li>Customizable rankings and tournament field filter</li>
            <li>Matchup model and live game context</li>
            <li>Bracket analysis, path difficulty, and simulation</li>
            <li>Game value and futures value boards</li>
          </ul>
          <Link
            href="/ncaa"
            className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Explore NCAA
          </Link>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(15,23,42,0.4))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Pro Membership</h2>
            <Badge tone="sky">Coming online</Badge>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Unlock NFL, NBA, MLB, and PGA modules plus deeper premium boards,
            matchup packages, value screens, and multi-sport workflows.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li>NFL, NBA, MLB, and PGA premium dashboards</li>
            <li>Expanded matchup and betting model layers</li>
            <li>Deeper futures and market monitoring workflows</li>
            <li>Priority access to new premium tools</li>
          </ul>
          <Link
            href="/nfl"
            className="mt-6 inline-flex rounded-2xl border border-white/12 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-300/30 hover:bg-white/14"
          >
            Preview Pro Sports
          </Link>
        </section>
      </div>
    </div>
  );
}
