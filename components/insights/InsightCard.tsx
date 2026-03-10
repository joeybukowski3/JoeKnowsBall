import { Badge } from "@/components/shared/Badge";

type InsightCardProps = {
  eyebrow: string;
  title: string;
  value?: string;
  description?: string;
  tone?: "neutral" | "sky" | "emerald" | "amber" | "rose";
  children?: React.ReactNode;
};

export function InsightCard({
  eyebrow,
  title,
  value,
  description,
  tone = "neutral",
  children,
}: InsightCardProps) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(15,23,42,0.34))] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            {eyebrow}
          </p>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        {value ? <Badge tone={tone}>{value}</Badge> : null}
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
