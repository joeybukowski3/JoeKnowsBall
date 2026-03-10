import Link from "next/link";
import { TeamLogo } from "@/components/shared/TeamLogo";
import { getCanonicalTeamIdentity } from "@/lib/utils/teamMatcher";
import { getTeamMeta } from "@/lib/data/teamMeta";
import type { Team } from "@/lib/types";

type TeamChipProps = {
  name: string;
  shortName?: string;
  subtitle?: string;
  compact?: boolean;
  href?: string | null;
  team?: Team | null;
};

export function TeamChip({
  name,
  shortName,
  subtitle,
  compact = false,
  href,
  team,
}: TeamChipProps) {
  const meta = getTeamMeta(name);
  const teamHref =
    href === undefined
      ? name !== "TBD"
        ? `/ncaa/team/${getCanonicalTeamIdentity(name).id}`
        : null
      : href;
  const content = (
    <>
      <TeamLogo
        team={team}
        name={name}
        shortName={shortName}
        meta={meta}
        size={compact ? "sm" : "md"}
      />
      <div className="min-w-0">
        <p className={`truncate font-semibold text-white ${compact ? "text-sm" : "text-base"}`}>
          {name}
        </p>
        {subtitle ? (
          <p className="truncate text-xs text-slate-400">{subtitle}</p>
        ) : null}
      </div>
    </>
  );

  if (!teamHref) {
    return <div className="flex items-center gap-3">{content}</div>;
  }

  return (
    <Link href={teamHref} className="flex items-center gap-3 transition hover:opacity-90">
      {content}
    </Link>
  );
}
