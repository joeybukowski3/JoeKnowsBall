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
    <section className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Model Status
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Current NCAA model health and data coverage for the public board.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-slate-200">
            Model updated: <span className="font-semibold text-white">{status.updatedLabel}</span>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-slate-200">
            Stats coverage: <span className="font-semibold text-white">{status.statsCoveragePercent}%</span>
          </div>
          <Badge tone={tone}>{status.dataMode}</Badge>
        </div>
      </div>
    </section>
  );
}
