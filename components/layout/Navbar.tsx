"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/ncaa", label: "NCAA" },
  { href: "/nfl", label: "NFL" },
  { href: "/nba", label: "NBA" },
  { href: "/mlb", label: "MLB" },
  { href: "/pga", label: "PGA" },
  { href: "/matchup", label: "Matchup" },
  { href: "/bracket", label: "Bracket" },
  { href: "/betting", label: "Betting" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="flex min-h-[54px] flex-wrap items-center justify-between gap-3 px-2 py-2">
        <Link href="/" className="flex items-center gap-3">
          <span className="rounded-md bg-[var(--accent)] px-2 py-1 text-[11px] font-extrabold tracking-[0.16em] text-white">
            JKB
          </span>
          <span className="text-[15px] font-extrabold tracking-[-0.3px] text-[var(--text)]">
            Joe Knows Ball
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-[13px] font-medium ${
                  isActive
                    ? "border border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/pricing" className="ghost-button px-3 py-2">
            Pricing
          </Link>
          <Link href="/ncaa" className="primary-button px-3 py-2">
            NCAA Free
          </Link>
        </div>
      </div>
    </header>
  );
}
