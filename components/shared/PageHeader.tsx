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
    <section className="glass-panel relative overflow-hidden rounded-[10px] p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative space-y-2">
          <p className="section-label">
            {eyebrow}
          </p>
          <h1 className="page-title max-w-4xl text-[20px] sm:text-[22px]">
            {title}
          </h1>
          <p className="max-w-3xl text-[14px] leading-6 text-[var(--muted)]">{description}</p>
        </div>
        {children ? <div className="relative">{children}</div> : null}
      </div>
    </section>
  );
}
