import Link from "next/link";
import { Badge } from "@/components/shared/Badge";

type PremiumSportCardProps = {
  sport: string;
  description: string;
};

export function PremiumSportCard({ sport, description }: PremiumSportCardProps) {
  return (
    <article className="glass-panel relative overflow-hidden rounded-[28px] p-5">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-500/20 to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-white">{sport}</p>
          <Badge tone="amber">Pro</Badge>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
        <div className="mt-5 space-y-2 opacity-70">
          <div className="h-9 rounded-2xl border border-white/8 bg-white/[0.045] backdrop-blur-sm" />
          <div className="h-9 rounded-2xl border border-white/8 bg-white/[0.045] backdrop-blur-sm" />
          <div className="h-9 rounded-2xl border border-white/8 bg-white/[0.045] backdrop-blur-sm" />
        </div>
        <Link
          href="/pricing"
          className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-indigo-400/35 hover:bg-indigo-500/12"
        >
          Unlock {sport}
        </Link>
      </div>
    </article>
  );
}
