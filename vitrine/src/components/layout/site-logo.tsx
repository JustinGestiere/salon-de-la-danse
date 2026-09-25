import Link from "next/link";

export function SiteLogo() {
  return (
    <Link href="/" className="flex shrink-0 items-baseline gap-3 text-ink">
      <span className="font-display text-[26px] leading-none sm:text-[30px]">
        Salon de la <em className="text-accent">Danse</em>
      </span>
      <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-subtle sm:inline">Angers</span>
    </Link>
  );
}
