type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <section className="glass-panel relative overflow-hidden rounded-[10px] p-3.5 sm:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative space-y-1.5">
          <p className="section-label">
            {eyebrow}
          </p>
          <h1 className="page-title max-w-4xl text-[18px] sm:text-[20px]">
            {title}
          </h1>
          <p className="max-w-3xl text-[13px] leading-5 text-[var(--muted)]">{description}</p>
        </div>
        {children ? <div className="relative">{children}</div> : null}
      </div>
    </section>
  );
}
