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
    <header className="sticky top-4 z-30 rounded-[26px] border border-white/10 bg-slate-950/75 px-4 py-4 shadow-[0_24px_80px_rgba(2,6,23,0.32)] backdrop-blur-xl sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#e2e8f0_0%,#7dd3fc_30%,#1d4ed8_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <span className="text-sm font-black tracking-[0.3em] text-slate-950">JKB</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-sky-200">
              Joe Knows Ball
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Premium sports betting analytics
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/ncaa"
                ? pathname === item.href || pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-sky-300/25 bg-white text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                    : "border-white/8 bg-white/[0.04] text-slate-300 hover:border-sky-300/20 hover:bg-white/[0.08] hover:text-white"
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
