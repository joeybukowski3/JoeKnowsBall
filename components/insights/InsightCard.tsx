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
    <article className="surface-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="section-label">
            {eyebrow}
          </p>
          <h3 className="text-[14px] font-semibold leading-5 text-[var(--text)]">{title}</h3>
        </div>
        {value ? <Badge tone={tone}>{value}</Badge> : null}
      </div>
      {description ? (
        <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">{description}</p>
      ) : null}
      {children ? <div className="mt-2.5">{children}</div> : null}
    </article>
  );
}
