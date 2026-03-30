"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MobileMenuProps {
  locale: string;
}

const menuLinks = [
  { href: "/work/personal-work", key: "personalWork" },
  { href: "/work/commercial", key: "commercial" },
  { href: "/work/editorial", key: "editorial" },
  { href: "/films", key: "films" },
  { href: "/about", key: "about" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
  { href: "/print-sale", key: "printSale" },
] as const;

export function MobileMenu({ locale }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-bg border-b border-border z-50 flex items-center justify-between px-6">
        <Link href="/" className="text-lg font-serif text-primary">
          Marie Meister
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-body p-2"
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {isOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M3 8h18M3 16h18" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16" />

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-[280px] bg-bg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-20 px-8">
          <nav>
            <ul className="space-y-1">
              {menuLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-2.5 text-sm tracking-wide transition-colors ${
                        isActive ? "text-accent" : "text-body hover:text-accent"
                      }`}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-8 pt-6 border-t border-border">
            <LanguageSwitcher locale={locale} />
            <div className="mt-4">
              <a
                href="https://www.instagram.com/hypsoindia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
