import Link from "next/link";
import { Badge } from "@/components/shared/Badge";

type PremiumSportCardProps = {
  sport: string;
  description: string;
};

export function PremiumSportCard({ sport, description }: PremiumSportCardProps) {
  return (
    <article className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(15,23,42,0.5))] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/8 to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-white">{sport}</p>
          <Badge tone="amber">Pro</Badge>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
        <div className="mt-5 space-y-2 opacity-70">
          <div className="h-9 rounded-2xl border border-white/8 bg-white/6 backdrop-blur-sm" />
          <div className="h-9 rounded-2xl border border-white/8 bg-white/6 backdrop-blur-sm" />
          <div className="h-9 rounded-2xl border border-white/8 bg-white/6 backdrop-blur-sm" />
        </div>
        <Link
          href="/pricing"
          className="mt-5 inline-flex rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Unlock {sport}
        </Link>
      </div>
    </article>
  );
}
