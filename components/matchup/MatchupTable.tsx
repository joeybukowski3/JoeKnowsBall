import { Badge } from "@/components/shared/Badge";
import type { MatchupSummary, Team } from "@/lib/types";

type MatchupTableProps = {
  summary: MatchupSummary;
  teamA: Team;
  teamB: Team;
};

function formatValue(label: string, value: number) {
  return label === "SOS" || label === "Recent Form" ? value.toFixed(0) : value.toFixed(1);
}

export function MatchupTable({ summary, teamA, teamB }: MatchupTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/8">
          <thead className="bg-white/[0.06] text-left">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">{teamA.name}</th>
              <th className="px-4 py-3">{teamB.name}</th>
              <th className="px-4 py-3 text-right">Edge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8 bg-transparent">
            {summary.rows.map((row) => (
              <tr key={row.label} className="hover:bg-white/[0.04]">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{row.label}</p>
                    {row.label !== "Overall Model Score" ? <p className="text-xs text-slate-500">{row.active ? `Weight ${row.weight}` : "Inactive"}</p> : null}
                  </div>
                </td>
                <td className={`px-4 py-3 text-sm ${row.edge === "teamA" ? "font-semibold text-sky-300" : "text-slate-300"}`}>{formatValue(row.label, row.teamAValue)}</td>
                <td className={`px-4 py-3 text-sm ${row.edge === "teamB" ? "font-semibold text-sky-300" : "text-slate-300"}`}>{formatValue(row.label, row.teamBValue)}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <Badge tone={row.edge === "even" ? "neutral" : "sky"}>
                    {row.edge === "even" ? "Even" : row.edge === "teamA" ? teamA.shortName : teamB.shortName}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
