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
    <header className="sticky top-4 z-30 rounded-2xl border border-slate-800/80 bg-slate-950/85 px-4 py-4 shadow-2xl shadow-slate-950/30 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">
            Joe Knows Ball
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Multi-sport betting analytics platform
          </p>
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
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-100 text-slate-950"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
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
