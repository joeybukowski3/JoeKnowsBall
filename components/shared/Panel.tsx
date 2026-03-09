type PanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Panel({ eyebrow, title, description, children }: PanelProps) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.22)] backdrop-blur-sm">
      <div className="mb-5 space-y-2 border-b border-white/8 pb-4">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-200/85">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
