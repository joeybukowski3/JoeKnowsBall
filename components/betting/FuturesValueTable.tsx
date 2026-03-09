"use client";

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
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "Medium":
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
    case "Small":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    default:
      return "border-slate-700 bg-slate-900 text-slate-300";
  }
}

export function FuturesValueTable({
  rows,
  sortKey,
  sortDirection,
  onSort,
}: FuturesValueTableProps) {
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
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] divide-y divide-slate-800 text-left">
          <thead className="bg-slate-900/90">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className={`inline-flex items-center gap-2 ${
                      sortKey === column.key ? "text-slate-100" : "hover:text-slate-200"
                    }`}
                  >
                    <span>{column.label}</span>
                    <span className="w-3 text-center text-[11px]">
                      {sortKey === column.key ? (sortDirection === "desc" ? "↓" : "↑") : " "}
                    </span>
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {rows.map((row) => (
              <tr key={row.team.id} className="hover:bg-slate-900/60">
                <td className="px-4 py-3 text-sm font-semibold text-white">
                  {row.team.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">#{row.rank}</td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {formatAmericanOdds(row.titleOdds)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {(row.impliedTitleProbability * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {(row.modelTitleProbability * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm font-medium text-emerald-300">
                  {row.futuresEdge > 0
                    ? `+${(row.futuresEdge * 100).toFixed(1)}%`
                    : `${(row.futuresEdge * 100).toFixed(1)}%`}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {row.pathDifficulty.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getTierTone(row.valueTier)}`}
                  >
                    {row.valueTier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
