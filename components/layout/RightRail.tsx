import Link from "next/link";
import { Badge } from "@/components/shared/Badge";

export function RightRail() {
  return (
    <aside className="sticky top-[72px] hidden h-fit xl:block">
      <div className="space-y-3">
        <div className="surface-card p-3.5">
          <p className="section-label">Live Now</p>
          <h3 className="mt-1.5 text-[15px] font-extrabold leading-5 text-[var(--text)]">
            NCAA tournament tools are open
          </h3>
          <p className="mt-1.5 text-[13px] leading-5 text-[var(--muted)]">
            Rankings, matchup analysis, bracket builds, and betting value screens are available right now.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="emerald">Live</Badge>
            <Badge tone="neutral">Free Access</Badge>
          </div>
        </div>

        <div className="surface-card p-3.5">
          <p className="section-label">Quick Start</p>
          <div className="mt-2.5 space-y-1.5">
            <Link href="/ncaa" className="ghost-button w-full px-3 py-2">
              Open NCAA Rankings
            </Link>
            <Link href="/betting/best-bets" className="ghost-button w-full px-3 py-2">
              See Best Bets
            </Link>
            <Link href="/pricing" className="primary-button w-full px-3 py-2">
              Upgrade to Pro
            </Link>
          </div>
        </div>

        <div className="surface-card p-3.5">
          <p className="section-label">Pro Roadmap</p>
          <div className="mt-2.5 space-y-1.5 text-[13px] text-[var(--muted)]">
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5">
              <span>NFL analytics</span>
              <Badge tone="neutral">Pro</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5">
              <span>NBA models</span>
              <Badge tone="neutral">Pro</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5">
              <span>MLB board</span>
              <Badge tone="neutral">Pro</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5">
              <span>PGA outrights</span>
              <Badge tone="neutral">Pro</Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
