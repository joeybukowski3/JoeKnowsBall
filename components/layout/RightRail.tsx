import Link from "next/link";
import { Badge } from "@/components/shared/Badge";

export function RightRail() {
  return (
    <aside className="sticky top-[72px] hidden h-fit xl:block">
      <div className="space-y-4">
        <div className="surface-card p-4">
          <p className="section-label">Live Now</p>
          <h3 className="mt-2 text-[16px] font-extrabold text-[var(--text)]">
            NCAA tournament tools are open
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Rankings, matchup analysis, bracket builds, and betting value screens are available right now.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="emerald">Live</Badge>
            <Badge tone="neutral">Free Access</Badge>
          </div>
        </div>

        <div className="surface-card p-4">
          <p className="section-label">Quick Start</p>
          <div className="mt-3 space-y-2">
            <Link href="/ncaa" className="ghost-button w-full px-3 py-2.5">
              Open NCAA Rankings
            </Link>
            <Link href="/betting/best-bets" className="ghost-button w-full px-3 py-2.5">
              See Best Bets
            </Link>
            <Link href="/pricing" className="primary-button w-full px-3 py-2.5">
              Upgrade to Pro
            </Link>
          </div>
        </div>

        <div className="surface-card p-4">
          <p className="section-label">Pro Roadmap</p>
          <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
              <span>NFL analytics</span>
              <Badge tone="neutral">Pro</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
              <span>NBA models</span>
              <Badge tone="neutral">Pro</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
              <span>MLB board</span>
              <Badge tone="neutral">Pro</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
              <span>PGA outrights</span>
              <Badge tone="neutral">Pro</Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
