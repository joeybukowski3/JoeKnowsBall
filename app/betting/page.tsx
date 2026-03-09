import { ValueTable } from "@/components/betting/ValueTable";
import { Panel } from "@/components/shared/Panel";
import { odds } from "@/lib/data";

export default function BettingPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
          Betting Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Futures and edge tracker
        </h1>
        <p className="max-w-2xl text-sm text-slate-400">
          Placeholder betting table for market screens, fair price estimates,
          and portfolio management.
        </p>
      </section>

      <Panel
        eyebrow="Markets"
        title="Value table"
        description="Mock sportsbook pricing, implied probability, and projected edge columns."
      >
        <ValueTable odds={odds} />
      </Panel>
    </div>
  );
}
