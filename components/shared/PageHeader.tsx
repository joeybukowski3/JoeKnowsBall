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
    <section className="glass-panel relative overflow-hidden rounded-[34px] p-7 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.08),transparent_24%)]" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-200/90">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[3.2rem]">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400 sm:text-[15px]">{description}</p>
        </div>
        {children ? <div className="relative">{children}</div> : null}
      </div>
    </section>
  );
}
