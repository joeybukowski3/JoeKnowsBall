"use client";

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

const columns: Array<{
  key: RankingsSortKey;
  label: string;
  align?: "left" | "right";
}> = [
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

function getSortIndicator(
  active: boolean,
  direction: RankingsSortState["direction"],
) {
  if (!active) {
    return " ";
  }

  return direction === "asc" ? "↑" : "↓";
}

export function RankingsTable({ rows, sort, onSort }: RankingsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] divide-y divide-slate-800 text-left">
          <thead className="bg-slate-900/90">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {columns.map((column) => {
                const isActive = sort.key === column.key;

                return (
                  <th
                    key={column.key}
                    className={`px-4 py-3 ${column.align === "right" ? "text-right" : "text-left"}`}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      className={`inline-flex items-center gap-2 rounded-md px-1 py-1 transition ${
                        isActive ? "text-slate-100" : "hover:text-slate-200"
                      }`}
                    >
                      <span>{column.label}</span>
                      <span className="w-3 text-center text-[11px]">
                        {getSortIndicator(isActive, sort.direction)}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {rows.map((row) => {
              const valueTone =
                row.valueLabel === "Strong"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : row.valueLabel === "Watch"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    : "border-slate-700 bg-slate-900 text-slate-300";

              return (
                <tr key={row.team.id} className="hover:bg-slate-900/70">
                  <td className="px-4 py-3 text-sm font-semibold text-white">
                    {row.rank}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {row.team.name}
                      </p>
                      <p className="text-xs text-slate-500">{row.team.record}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {row.team.conference}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-sky-300">
                    {row.overallScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {row.categoryScores.offense.raw.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {row.categoryScores.defense.raw.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {row.categoryScores.shooting.raw.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {row.categoryScores.rebounding.raw.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {row.categoryScores.sos.raw.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {row.categoryScores.recentForm.raw.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${valueTone}`}
                    >
                      {row.valueLabel}
                    </span>
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
