type PanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function Panel({ eyebrow, title, description, children }: PanelProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-[10px] p-4 lg:p-5">
      <div className="relative mb-4 space-y-1.5 border-b border-[var(--border)] pb-3.5">
        {eyebrow ? (
          <p className="section-label">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="page-title text-[18px]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-[13px] leading-5 text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
