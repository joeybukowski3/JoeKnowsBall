"use client";

import { Badge } from "@/components/shared/Badge";
import { TeamChip } from "@/components/shared/TeamChip";
import { formatAmericanOdds } from "@/lib/utils/oddsCalculator";
import type { GameValueRow } from "@/lib/types";

type GameValueTableProps = {
  rows: GameValueRow[];
};

function getTierTone(valueTier: GameValueRow["valueTier"]) {
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

export function GameValueTable({ rows }: GameValueTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-[1320px] divide-y divide-white/8 text-left">
          <thead className="bg-white/[0.06]">
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
          <tbody className="divide-y divide-white/8 bg-transparent">
            {rows.map((row) => (
              <tr key={row.game.id} className="hover:bg-white/[0.04]">
                <td className="px-4 py-3">
                  <TeamChip team={row.awayTeam} name={row.awayTeam.name} shortName={row.awayTeam.shortName} subtitle={`at ${row.homeTeam.name}`} compact />
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">{row.game.startTime}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">{row.sportsbookSpread > 0 ? `+${row.sportsbookSpread}` : row.sportsbookSpread}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">{row.modelSpread > 0 ? `+${row.modelSpread}` : row.modelSpread}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-sky-300">{row.spreadEdge > 0 ? `+${row.spreadEdge.toFixed(1)}` : row.spreadEdge.toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">{formatAmericanOdds(row.sportsbookMoneyline)}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">{(row.modelWinProbability * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">{(row.impliedWinProbability * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-emerald-300">{row.moneylineEdge > 0 ? `+${(row.moneylineEdge * 100).toFixed(1)}%` : `${(row.moneylineEdge * 100).toFixed(1)}%`}</td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">{row.upsetRisk}</td>
                <td className="px-4 py-3 text-right"><Badge tone={getTierTone(row.valueTier)}>{row.valueTier}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
