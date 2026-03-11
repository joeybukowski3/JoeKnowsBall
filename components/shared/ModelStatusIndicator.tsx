import { Badge } from "@/components/shared/Badge";
import type { ModelStatusSummary } from "@/lib/utils/modelStatus";

type ModelStatusIndicatorProps = {
  status: ModelStatusSummary;
};

export function ModelStatusIndicator({ status }: ModelStatusIndicatorProps) {
  const tone =
    status.dataMode === "Live Stats"
      ? "emerald"
      : status.dataMode === "Partial Fallback"
        ? "amber"
        : "neutral";

  return (
    <section className="surface-card px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-label">
            Model Status
          </p>
          <p className="mt-1.5 text-[13px] text-[var(--muted)]">
            Current NCAA model health and data coverage for the public board.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[13px] text-[var(--muted)]">
            Model updated: <span className="font-semibold text-[var(--text)]">{status.updatedLabel}</span>
          </div>
          <div className="rounded-[6px] border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[13px] text-[var(--muted)]">
            Stats coverage: <span className="font-semibold text-[var(--text)]">{status.statsCoveragePercent}%</span>
          </div>
          <Badge tone={tone}>{status.dataMode}</Badge>
        </div>
      </div>
    </section>
  );
}
