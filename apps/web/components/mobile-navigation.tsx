"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@capoeira-ghana/ui";

const navigation = [
  { label: "Programs", href: "#programs" },
  { label: "Classes", href: "#classes" },
  { label: "Events", href: "#events" },
  { label: "About", href: "#about" },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]"
      >
        <span className="sr-only">
          {isOpen ? "Close menu" : "Open menu"}
        </span>

        <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
          <span
            className={`h-0.5 w-full bg-[var(--foreground)] transition-transform ${
              isOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-full bg-[var(--foreground)] transition-opacity ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-full bg-[var(--foreground)] transition-transform ${
              isOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="absolute left-0 right-0 top-full border-b border-[var(--border)] bg-[var(--background)] px-6 py-6 shadow-lg"
        >
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col gap-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 text-base font-medium hover:bg-[var(--surface-muted)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <Button
                href="#trial"
                className="w-full"
                onClick={closeMenu}
              >
                Book a Trial
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}