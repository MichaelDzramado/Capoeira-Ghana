import Link from "next/link";
import { Button } from "@capoeira-ghana/ui";
import { MobileNavigation } from "./mobile-navigation";

const navigation = [
  { label: "Programs", href: "#programs" },
  { label: "Classes", href: "#classes" },
  { label: "Events", href: "#events" },
  { label: "About", href: "#about" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Capoeira Ghana home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
            CG
          </span>

          <span className="text-sm font-bold uppercase tracking-[0.12em] sm:block">
            Capoeira Ghana
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}

          <Button href="/book-a-trial" className="min-h-11 px-5 text-sm">
            Book a Trial
          </Button>
        </nav>

        <MobileNavigation />
      </div>
    </header>
  );
}
