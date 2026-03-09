import { getTeamMeta } from "@/lib/data/teamMeta";

type TeamChipProps = {
  name: string;
  shortName?: string;
  subtitle?: string;
  compact?: boolean;
};

export function TeamChip({
  name,
  shortName,
  subtitle,
  compact = false,
}: TeamChipProps) {
  const meta = getTeamMeta(name);

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ${
          compact ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm"
        }`}
        style={{
          background: `linear-gradient(135deg, ${meta.primary}, ${meta.secondary})`,
          color: meta.secondary === "#ffffff" ? "#0f172a" : "#ffffff",
        }}
      >
        <span className="font-black tracking-[0.12em]">{shortName ?? meta.monogram}</span>
      </div>
      <div className="min-w-0">
        <p className={`truncate font-semibold text-white ${compact ? "text-sm" : "text-base"}`}>
          {name}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-slate-400">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
