"use client";

import { useEffect, useMemo, useState } from "react";
import type { Team } from "@/lib/types";
import type { TeamMeta } from "@/lib/data/teamMeta";

const missingLogoWarnings = new Set<string>();
const failedLogoWarnings = new Set<string>();

type TeamLogoProps = {
  team?: Pick<Team, "name" | "shortName" | "logo" | "logoUrl" | "logoDarkUrl" | "logoLightUrl" | "hasLiveLogo"> | null;
  name: string;
  shortName?: string;
  meta: TeamMeta;
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "circle";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-base",
} as const;

export function TeamLogo({
  team,
  name,
  shortName,
  meta,
  size = "md",
  shape = "rounded",
  className = "",
}: TeamLogoProps) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const logoCandidates = useMemo(() => {
    const candidates = [
      team?.logoUrl,
      team?.logoLightUrl,
      team?.logoDarkUrl,
      team?.logo,
    ].filter((value): value is string => Boolean(value && value.trim()));

    return [...new Set(candidates)];
  }, [team?.logo, team?.logoDarkUrl, team?.logoLightUrl, team?.logoUrl]);

  const activeLogo = logoCandidates.find((candidate) => !failedUrls.includes(candidate)) ?? null;
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || activeLogo || !team || name === "TBD") {
      return;
    }

    const warningKey = team.name ?? name;
    if (missingLogoWarnings.has(warningKey)) {
      return;
    }

    missingLogoWarnings.add(warningKey);
    console.warn(`[team-logo] missing live logo for ${warningKey}`, {
      team,
    });
  }, [activeLogo, name, team]);

  if (activeLogo) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-[var(--border)] bg-[var(--bg)] ${shapeClass} ${sizeClasses[size]} ${className}`.trim()}
      >
        {/* Use a native img so remote logos work without adding image host config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeLogo}
          alt={`${name} logo`}
          className="h-full w-full object-contain p-1.5"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (process.env.NODE_ENV !== "production") {
              const warningKey = `${name}:${activeLogo}`;
              if (!failedLogoWarnings.has(warningKey)) {
                failedLogoWarnings.add(warningKey);
                console.warn(`[team-logo] failed to load live logo for ${name}: ${activeLogo}`);
              }
            }

            setFailedUrls((current) =>
              current.includes(activeLogo) ? current : [...current, activeLogo],
            );
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--bg)] ${shapeClass} ${sizeClasses[size]} ${className}`.trim()}
      style={{
        color: "var(--accent)",
      }}
      aria-label={`${name} monogram`}
    >
      <span className="font-black tracking-[0.12em]">
        {shortName ?? team?.shortName ?? meta.monogram}
      </span>
    </div>
  );
}
