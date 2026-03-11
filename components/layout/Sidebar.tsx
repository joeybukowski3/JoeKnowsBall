"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/shared/Badge";

const sections = [
  {
    label: "Free Tools",
    items: [
      { href: "/ncaa", icon: "🏀", label: "NCAA Rankings", badge: "Live" as const },
      { href: "/matchup", icon: "🆚", label: "Matchup Tool", badge: "Live" as const },
      { href: "/bracket", icon: "🧩", label: "Bracket Builder", badge: "Live" as const },
      { href: "/betting", icon: "💸", label: "Betting Board", badge: "Live" as const },
      { href: "/betting/best-bets", icon: "🔥", label: "Best Bets Today", badge: "Live" as const },
      { href: "/ncaa/insights", icon: "📝", label: "Daily Insights", badge: "Live" as const },
    ],
  },
  {
    label: "Pro Sports",
    items: [
      { href: "/nfl", icon: "🏈", label: "NFL", badge: "Pro" as const },
      { href: "/nba", icon: "🏀", label: "NBA", badge: "Pro" as const },
      { href: "/mlb", icon: "⚾", label: "MLB", badge: "Pro" as const },
      { href: "/pga", icon: "⛳", label: "PGA", badge: "Pro" as const },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-[72px] hidden h-fit xl:block">
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.7px] text-[var(--muted)]">
              {section.label}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between gap-3 rounded-[10px] border px-3 py-2.5 text-[13px] transition ${
                      active
                        ? "border-[var(--accent-mid)] bg-[var(--accent-light)] text-[var(--accent)]"
                        : "border-transparent bg-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="inline-flex w-6 justify-center text-base">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </span>
                    <Badge tone={item.badge === "Live" ? "emerald" : "neutral"}>{item.badge}</Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
