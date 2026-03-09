import type { Odds } from "@/lib/types";

type ValueTableProps = {
  odds: Odds[];
};

export function ValueTable({ odds }: ValueTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/90 text-left">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Implied</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Edge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {odds.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3 text-sm font-semibold text-white">
                  {entry.team}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {entry.market}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {entry.book}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {entry.price > 0 ? `+${entry.price}` : entry.price}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {(entry.impliedProbability * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {(entry.modelProbability * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm font-medium text-emerald-300">
                  {((entry.modelProbability - entry.impliedProbability) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
