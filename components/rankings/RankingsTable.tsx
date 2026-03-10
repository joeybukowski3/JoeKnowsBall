"use client";

import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import type { RankingResultRow } from "@/lib/types";

export type RankingsSortKey =
  | "rank"
  | "team"
  | "conference"
  | "overallScore"
  | "offense"
  | "defense"
  | "shooting"
  | "rebounding"
  | "sos"
  | "recentForm"
  | "valueLabel";

export type RankingsSortState = {
  key: RankingsSortKey;
  direction: "asc" | "desc";
};

type RankingsTableProps = {
  rows: RankingResultRow[];
  sort: RankingsSortState;
  onSort: (key: RankingsSortKey) => void;
};

const columns: Array<{ key: RankingsSortKey; label: string; align?: "left" | "right" }> = [
  { key: "rank", label: "Rank" },
  { key: "team", label: "Team" },
  { key: "conference", label: "Conference" },
  { key: "overallScore", label: "Overall", align: "right" },
  { key: "offense", label: "Offense", align: "right" },
  { key: "defense", label: "Defense", align: "right" },
  { key: "shooting", label: "Shooting", align: "right" },
  { key: "rebounding", label: "Rebounding", align: "right" },
  { key: "sos", label: "SOS", align: "right" },
  { key: "recentForm", label: "Recent", align: "right" },
  { key: "valueLabel", label: "Value", align: "right" },
];

function getSortIndicator(active: boolean, direction: RankingsSortState["direction"]) {
  if (!active) {
    return " ";
  }

  return direction === "asc" ? "↑" : "↓";
}

export function RankingsTable({ rows, sort, onSort }: RankingsTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/35">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] divide-y divide-white/8 text-left">
          <thead className="bg-white/[0.06]">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {columns.map((column) => {
                const isActive = sort.key === column.key;

                return (
                  <th key={column.key} className={`px-4 py-3 ${column.align === "right" ? "text-right" : "text-left"}`}>
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      className={`inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition ${
                        isActive ? "bg-white/[0.08] text-slate-50" : "hover:bg-white/[0.04] hover:text-slate-200"
                      }`}
                    >
                      <span>{column.label}</span>
                      <span className="w-3 text-center text-[11px]">{getSortIndicator(isActive, sort.direction)}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8 bg-transparent">
            {rows.map((row) => {
              const badgeTone = row.valueLabel === "Strong" ? "emerald" : row.valueLabel === "Watch" ? "amber" : "neutral";

              return (
                <tr key={row.team.id} className="hover:bg-white/[0.04]">
                  <td className="px-4 py-3 text-sm font-semibold text-white">
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs">#{row.rank}</span>
                  </td>
                  <td className="px-4 py-3">
                    <TeamChip team={row.team} name={row.team.name} shortName={row.team.shortName} subtitle={row.team.record} compact />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.team.conference}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-sky-300">{row.overallScore.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">{row.categoryScores.offense.raw.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">{row.categoryScores.defense.raw.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">{row.categoryScores.shooting.raw.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">{row.categoryScores.rebounding.raw.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">{row.categoryScores.sos.raw.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">{row.categoryScores.recentForm.raw.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge tone={badgeTone}>{row.valueLabel}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
