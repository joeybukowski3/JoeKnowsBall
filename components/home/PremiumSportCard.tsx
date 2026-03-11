import Link from "next/link";
import { Badge } from "@/components/shared/Badge";

type PremiumSportCardProps = {
  sport: string;
  description: string;
};

export function PremiumSportCard({ sport, description }: PremiumSportCardProps) {
  return (
    <article className="surface-card relative overflow-hidden p-5">
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-extrabold text-[var(--text)]">{sport}</p>
          <Badge tone="amber">Pro</Badge>
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
        <div className="mt-5 space-y-2 opacity-70">
          <div className="h-9 rounded-[8px] border border-[var(--border)] bg-[var(--bg)]" />
          <div className="h-9 rounded-[8px] border border-[var(--border)] bg-[var(--bg)]" />
          <div className="h-9 rounded-[8px] border border-[var(--border)] bg-[var(--bg)]" />
        </div>
        <Link
          href="/pricing"
          className="ghost-button mt-5 px-4 py-2.5"
        >
          Unlock {sport}
        </Link>
      </div>
    </article>
  );
}
