type PanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Panel({ eyebrow, title, description, children }: PanelProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-[30px] p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.16),transparent_60%)]" />
      <div className="relative mb-6 space-y-2 border-b border-white/7 pb-5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/90">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[1.4rem] font-semibold tracking-[-0.03em] text-white">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-7 text-slate-400">{description}</p>
        ) : null}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
