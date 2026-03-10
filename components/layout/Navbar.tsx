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
    <header className="glass-panel sticky top-4 z-30 overflow-hidden rounded-[30px] px-4 py-4 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-[radial-gradient(circle_at_left,rgba(79,70,229,0.22),transparent_70%)]" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-[20px] border border-white/12 bg-[linear-gradient(135deg,#4f46e5_0%,#312e81_55%,#0f172a_100%)] shadow-[0_12px_40px_rgba(79,70,229,0.28),inset_0_1px_0_rgba(255,255,255,0.18)]">
              <span className="text-sm font-black tracking-[0.32em] text-white">JKB</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-indigo-200">
                Joe Knows Ball
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Premium sports betting intelligence
              </p>
            </div>
          </Link>
        </div>
        <nav className="flex flex-wrap gap-2.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  isActive
                    ? "border-indigo-300/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(226,232,240,0.92))] text-slate-950 shadow-[0_14px_36px_rgba(255,255,255,0.12)]"
                    : "border-white/8 bg-white/[0.035] text-slate-300 hover:border-indigo-400/35 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
