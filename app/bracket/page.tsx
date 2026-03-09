import { BracketBoard } from "@/components/bracket/BracketBoard";
import { Panel } from "@/components/shared/Panel";
import { games } from "@/lib/data";

export default function BracketPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
          Bracket Toolkit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Tournament path and region board
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Starter bracket view for path difficulty, upset risk, and regional
          structure analysis.
        </p>
      </section>

      <Panel
        eyebrow="Bracket View"
        title="Regional board"
        description="Placeholder tournament board with slots ready for simulation and advancement odds."
      >
        <BracketBoard games={games.slice(0, 8)} />
      </Panel>
    </div>
  );
}
