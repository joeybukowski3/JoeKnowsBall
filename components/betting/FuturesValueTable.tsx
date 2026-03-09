"use client";

import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import type { FuturesValueRow } from "@/lib/types";
import { formatAmericanOdds } from "@/lib/utils/oddsCalculator";

export type FuturesSortKey =
  | "team"
  | "rank"
  | "titleOdds"
  | "impliedTitleProbability"
  | "modelTitleProbability"
  | "futuresEdge"
  | "pathDifficulty";

type FuturesValueTableProps = {
  rows: FuturesValueRow[];
  sortKey: FuturesSortKey;
  sortDirection: "asc" | "desc";
  onSort: (key: FuturesSortKey) => void;
};

function getTierTone(valueTier: FuturesValueRow["valueTier"]) {
  switch (valueTier) {
    case "Strong":
      return "emerald";
    case "Medium":
      return "sky";
    case "Small":
      return "amber";
    default:
      return "neutral";
  }
}

export function FuturesValueTable({ rows, sortKey, sortDirection, onSort }: FuturesValueTableProps) {
  const columns: Array<{ key: FuturesSortKey; label: string }> = [
    { key: "team", label: "Team" },
    { key: "rank", label: "Rank" },
    { key: "titleOdds", label: "Odds" },
    { key: "impliedTitleProbability", label: "Implied" },
    { key: "modelTitleProbability", label: "Model" },
    { key: "futuresEdge", label: "Edge" },
    { key: "pathDifficulty", label: "Path" },
  ];

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] divide-y divide-white/8 text-left">
          <thead className="bg-white/[0.06]">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className={`inline-flex items-center gap-2 ${sortKey === column.key ? "text-slate-100" : "hover:text-slate-200"}`}
                  >
                    <span>{column.label}</span>
                    <span className="w-3 text-center text-[11px]">{sortKey === column.key ? (sortDirection === "desc" ? "↓" : "↑") : " "}</span>
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8 bg-transparent">
            {rows.map((row) => (
              <tr key={row.team.id} className="hover:bg-white/[0.04]">
                <td className="px-4 py-3">
                  <TeamChip name={row.team.name} shortName={row.team.shortName} subtitle={row.team.conference} compact />
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">#{row.rank}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{formatAmericanOdds(row.titleOdds)}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{(row.impliedTitleProbability * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm text-slate-300">{(row.modelTitleProbability * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm font-medium text-emerald-300">{row.futuresEdge > 0 ? `+${(row.futuresEdge * 100).toFixed(1)}%` : `${(row.futuresEdge * 100).toFixed(1)}%`}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{row.pathDifficulty.toFixed(1)}</td>
                <td className="px-4 py-3 text-right"><Badge tone={getTierTone(row.valueTier)}>{row.valueTier}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
