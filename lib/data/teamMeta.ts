import { getCanonicalTeamIdentity } from "@/lib/utils/teamMatcher";

type TeamMeta = {
  primary: string;
  secondary: string;
  monogram: string;
};

const teamMeta: Record<string, TeamMeta> = {
  Houston: { primary: "#c8102e", secondary: "#ffffff", monogram: "UH" },
  Connecticut: { primary: "#0b2343", secondary: "#ffffff", monogram: "UC" },
  Purdue: { primary: "#cfb991", secondary: "#000000", monogram: "PU" },
  Tennessee: { primary: "#ff8200", secondary: "#ffffff", monogram: "TN" },
  Arizona: { primary: "#0c234b", secondary: "#ab0520", monogram: "AZ" },
  "North Carolina": { primary: "#7bafd4", secondary: "#13294b", monogram: "NC" },
  Duke: { primary: "#003087", secondary: "#ffffff", monogram: "DU" },
  "Iowa State": { primary: "#c8102e", secondary: "#f1be48", monogram: "IS" },
  Alabama: { primary: "#9e1b32", secondary: "#ffffff", monogram: "AL" },
  Creighton: { primary: "#005ca9", secondary: "#ffffff", monogram: "CR" },
  Wisconsin: { primary: "#c5050c", secondary: "#ffffff", monogram: "WI" },
  "Florida Atlantic": { primary: "#003366", secondary: "#cc0000", monogram: "FA" },
};

function deriveMonogram(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getTeamMeta(name: string) {
  const canonicalName = getCanonicalTeamIdentity(name).displayName;
  const meta = teamMeta[canonicalName] ?? teamMeta[name];

  if (meta) {
    return meta;
  }

  return {
    primary: "#38bdf8",
    secondary: "#f8fafc",
    monogram: deriveMonogram(canonicalName),
  };
}
