import type { Team } from "@/lib/types";

type MatchupTableProps = {
  teams: Team[];
};

const rows = [
  { label: "Adjusted Offense", key: "adjustedOffense" },
  { label: "Adjusted Defense", key: "adjustedDefense" },
  { label: "Tempo", key: "tempo" },
  { label: "Effective FG%", key: "effectiveFieldGoalPct" },
  { label: "Rebound Rate", key: "reboundRate" },
] as const;

export function MatchupTable({ teams }: MatchupTableProps) {
  const [teamA, teamB] = teams;

  if (!teamA || !teamB) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/90 text-left">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">{teamA.name}</th>
              <th className="px-4 py-3">{teamB.name}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-3 text-sm font-medium text-white">
                  {row.label}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {teamA.stats[row.key]}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {teamB.stats[row.key]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
