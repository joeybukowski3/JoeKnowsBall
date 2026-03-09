import type { Team } from "@/lib/types";

type RankingsTableProps = {
  teams: Team[];
};

export function RankingsTable({ teams }: RankingsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-left">
          <thead className="bg-slate-900/90">
            <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Record</th>
              <th className="px-4 py-3">Adj OE</th>
              <th className="px-4 py-3">Adj DE</th>
              <th className="px-4 py-3">Tempo</th>
              <th className="px-4 py-3">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {teams.map((team, index) => (
              <tr key={team.id} className="hover:bg-slate-900/80">
                <td className="px-4 py-3 text-sm font-semibold text-white">
                  {index + 1}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {team.name}
                    </p>
                    <p className="text-xs text-slate-400">{team.conference}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {team.record}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {team.stats.adjustedOffense.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {team.stats.adjustedDefense.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {team.stats.tempo.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-sky-300">
                  {(
                    team.stats.adjustedOffense - team.stats.adjustedDefense
                  ).toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
