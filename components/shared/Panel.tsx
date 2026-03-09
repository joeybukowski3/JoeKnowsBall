type PanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Panel({ eyebrow, title, description, children }: PanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/20">
      <div className="mb-5 space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm text-slate-400">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
