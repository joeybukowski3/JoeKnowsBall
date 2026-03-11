"use client";

import { Badge } from "@/components/shared/Badge";
import { StrengthBar } from "@/components/shared/StrengthBar";
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

function renderCategoryCell(value: number, normalized: number, decimals = 1) {
  return (
    <div className="ml-auto flex min-w-[120px] items-center justify-end gap-3">
      <div className="w-16">
        <StrengthBar value={normalized * 100} compact />
      </div>
      <span>{value.toFixed(decimals)}</span>
    </div>
  );
}

export function RankingsTable({ rows, sort, onSort }: RankingsTableProps) {
  return (
    <div className="data-table-wrap">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[1180px] text-left">
          <thead className="bg-[var(--bg)]">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {columns.map((column) => {
                const isActive = sort.key === column.key;

                return (
                  <th key={column.key} className={`px-4 py-3 ${column.align === "right" ? "text-right" : "text-left"}`}>
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      className={`inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition ${
                        isActive ? "bg-indigo-500/14 text-slate-50" : "hover:bg-white/[0.04] hover:text-slate-200"
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
                <tr key={row.team.id} className={`group hover:bg-[#f5f7fb] ${row.rank <= 3 ? "bg-[#fffbf0]" : ""}`}>
                  <td className="px-4 py-3 text-sm font-semibold text-white">
                    <span className={`rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-extrabold ${
                      row.rank === 1
                        ? "text-[var(--gold)]"
                        : row.rank === 2
                          ? "text-slate-500"
                          : row.rank === 3
                            ? "text-amber-800"
                            : "text-[var(--text)]"
                    }`}>#{row.rank}</span>
                  </td>
                  <td className="px-4 py-3">
                    <TeamChip team={row.team} name={row.team.name} shortName={row.team.shortName} subtitle={row.team.record} compact />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.team.conference}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-indigo-200">
                    <div className="flex min-w-[110px] items-center justify-end gap-3">
                      <div className="w-16">
                        <StrengthBar value={row.overallScore} compact />
                      </div>
                      <span>{row.overallScore.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {renderCategoryCell(row.categoryScores.offense.raw, row.categoryScores.offense.normalized)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {renderCategoryCell(row.categoryScores.defense.raw, row.categoryScores.defense.normalized)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {renderCategoryCell(row.categoryScores.shooting.raw, row.categoryScores.shooting.normalized)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {renderCategoryCell(row.categoryScores.rebounding.raw, row.categoryScores.rebounding.normalized)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {renderCategoryCell(row.categoryScores.sos.raw, row.categoryScores.sos.normalized, 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-300">
                    {renderCategoryCell(row.categoryScores.recentForm.raw, row.categoryScores.recentForm.normalized, 0)}
                  </td>
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
