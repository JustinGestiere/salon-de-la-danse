import Link from "next/link";

import { FOOTER_NAV_GROUPS } from "@/components/layout/navigation";
import { CONTACT, SOCIAL_LINKS } from "@/features/edition/content";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 text-sm text-muted sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-16">
        <div className="flex flex-col gap-3">
          <p className="font-display text-3xl text-ink">
            Salon de la <em className="text-accent">Danse</em>
          </p>
          <p>Organisé par {CONTACT.organizer}, Angers</p>
          <ul className="flex gap-4">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {FOOTER_NAV_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title} className="flex flex-col gap-2">
            <p className="font-semibold text-ink">{group.title}</p>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
        ))}
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-ink">Contact</p>
          <a href={CONTACT.phoneHref} className="hover:text-ink">{CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`} className="break-all hover:text-ink">{CONTACT.email}</a>
        </div>
      </div>
    </footer>
  );
}
