import type { MatchupSummary, Team } from "@/lib/types";

type MatchupTableProps = {
  summary: MatchupSummary;
  teamA: Team;
  teamB: Team;
};

function formatValue(label: string, value: number) {
  if (label === "SOS" || label === "Recent Form") {
    return value.toFixed(0);
  }

  return value.toFixed(1);
}

export function MatchupTable({ summary, teamA, teamB }: MatchupTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/90 text-left">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">{teamA.name}</th>
              <th className="px-4 py-3">{teamB.name}</th>
              <th className="px-4 py-3 text-right">Edge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {summary.rows.map((row) => {
              const teamATone =
                row.edge === "teamA" ? "text-sky-300 font-semibold" : "text-slate-300";
              const teamBTone =
                row.edge === "teamB" ? "text-sky-300 font-semibold" : "text-slate-300";

              return (
                <tr key={row.label} className="hover:bg-slate-900/70">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{row.label}</p>
                      {row.label !== "Overall Model Score" ? (
                        <p className="text-xs text-slate-500">
                          {row.active ? `Weight ${row.weight}` : "Inactive"}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${teamATone}`}>
                    {formatValue(row.label, row.teamAValue)}
                  </td>
                  <td className={`px-4 py-3 text-sm ${teamBTone}`}>
                    {formatValue(row.label, row.teamBValue)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <span className="text-slate-400">
                      {row.edge === "even"
                        ? "Even"
                        : row.edge === "teamA"
                          ? teamA.shortName
                          : teamB.shortName}
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
