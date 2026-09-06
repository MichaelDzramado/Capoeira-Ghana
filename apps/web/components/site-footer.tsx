import Link from "next/link";

const exploreLinks = [
  { label: "Programs", href: "#programs" },
  { label: "Classes", href: "#classes" },
  { label: "Events", href: "#events" },
];

const companyLinks = [
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
  { label: "Book a Trial", href: "#trial" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link
              href="/"
              className="text-lg font-bold uppercase tracking-[0.12em]"
            >
              Capoeira Ghana
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Discover Capoeira, build movement and confidence, connect with
              community, and grow through the journey.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">
              Explore
            </h2>

            <ul className="mt-4 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">
              Connect
            </h2>

            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Capoeira Ghana. All rights reserved.
          </p>

          <p>Part of ASCENDE Africa</p>
        </div>
      </div>
    </footer>
  );
}