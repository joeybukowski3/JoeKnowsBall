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
    <article className="surface-card p-5">
      <p className="section-label">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-extrabold tracking-[-0.3px] text-[var(--text)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
      <Link
        href={href}
        className="ghost-button mt-5 px-4 py-2.5"
      >
        {cta}
      </Link>
    </article>
  );
}
