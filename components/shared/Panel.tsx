type PanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Panel({ eyebrow, title, description, children }: PanelProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-[10px] p-6 lg:p-7">
      <div className="relative mb-6 space-y-2 border-b border-[var(--border)] pb-5">
        {eyebrow ? (
          <p className="section-label">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="page-title text-[20px]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
