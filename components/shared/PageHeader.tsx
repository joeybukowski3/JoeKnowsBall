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
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.28)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200/90">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    </section>
  );
}
