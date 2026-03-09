"use client";

import { formatAmericanOdds } from "@/lib/utils/oddsCalculator";
import type { GameValueRow } from "@/lib/types";

type GameValueTableProps = {
  rows: GameValueRow[];
};

function getTierTone(valueTier: GameValueRow["valueTier"]) {
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

export function GameValueTable({ rows }: GameValueTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-[1320px] divide-y divide-slate-800 text-left">
          <thead className="bg-slate-900/90">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">Matchup</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3 text-right">Book Spread</th>
              <th className="px-4 py-3 text-right">Model Spread</th>
              <th className="px-4 py-3 text-right">Spread Edge</th>
              <th className="px-4 py-3 text-right">Moneyline</th>
              <th className="px-4 py-3 text-right">Model Win %</th>
              <th className="px-4 py-3 text-right">Implied %</th>
              <th className="px-4 py-3 text-right">ML Edge</th>
              <th className="px-4 py-3 text-right">Upset Risk</th>
              <th className="px-4 py-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {rows.map((row) => (
              <tr key={row.game.id} className="hover:bg-slate-900/60">
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-white">{row.matchup}</p>
                  <p className="text-xs text-slate-500">
                    {row.awayTeam.shortName} side model
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {row.game.startTime}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {row.sportsbookSpread > 0 ? `+${row.sportsbookSpread}` : row.sportsbookSpread}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {row.modelSpread > 0 ? `+${row.modelSpread}` : row.modelSpread}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-sky-300">
                  {row.spreadEdge > 0 ? `+${row.spreadEdge.toFixed(1)}` : row.spreadEdge.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {formatAmericanOdds(row.sportsbookMoneyline)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {(row.modelWinProbability * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {(row.impliedWinProbability * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-emerald-300">
                  {row.moneylineEdge > 0
                    ? `+${(row.moneylineEdge * 100).toFixed(1)}%`
                    : `${(row.moneylineEdge * 100).toFixed(1)}%`}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {row.upsetRisk}
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
