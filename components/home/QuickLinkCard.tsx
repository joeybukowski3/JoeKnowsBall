import Link from "next/link";

type QuickLinkCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export function QuickLinkCard({
  eyebrow,
  title,
  description,
  href,
  cta,
}: QuickLinkCardProps) {
  return (
    <article className="glass-panel rounded-[28px] p-5 hover:-translate-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-200/80">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-indigo-400/35 hover:bg-indigo-500/12"
      >
        {cta}
      </Link>
    </article>
  );
}
