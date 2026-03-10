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
    <article className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(15,23,42,0.36))] p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/80">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-2xl border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-sky-300/30 hover:bg-white/14"
      >
        {cta}
      </Link>
    </article>
  );
}
