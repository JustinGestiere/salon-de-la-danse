import { ButtonLink } from "@/components/ui/button-link";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLinks } from "@/components/layout/nav-links";
import { TICKETS_HREF } from "@/components/layout/navigation";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import type { SiteTheme } from "@/features/theme/theme";

export function SiteHeader({ theme }: { theme: SiteTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="relative mx-auto flex h-[72px] max-w-[1440px] items-center gap-6 px-4 sm:px-8 lg:h-[88px] lg:gap-10 lg:px-16">
        <SiteLogo />
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <NavLinks className="flex gap-6 text-[15px] xl:gap-7" />
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Sur téléphone, la bascule de thème passe dans le menu faute de place. */}
          <div className="hidden sm:block">
            <ThemeToggle theme={theme} />
          </div>
          <ButtonLink href={TICKETS_HREF} size="sm">
            Billetterie
          </ButtonLink>
          <MobileMenu theme={theme} />
        </div>
      </div>
    </header>
  );
}
