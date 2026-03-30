"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface SidebarProps {
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

export function Sidebar({ locale }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[280px] bg-bg border-r border-border z-40">
      {/* Logo */}
      <div className="px-8 pt-10 pb-6">
        <Link href="/" className="block">
          <h1 className="text-2xl font-normal text-primary tracking-wide font-serif">
            Marie
            <br />
            Meister
          </h1>
        </Link>
        <p className="text-xs text-muted mt-1 tracking-widest uppercase">
          Photography
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-8 py-4">
        <ul className="space-y-1">
          {menuLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className={`block py-2 text-sm tracking-wide transition-colors duration-200 ${
                    isActive
                      ? "text-accent"
                      : "text-body hover:text-accent"
                  }`}
                >
                  {t(link.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - right after menu */}
      <div className="px-8 pb-8 mt-4">
        <LanguageSwitcher locale={locale} />
        <div className="mt-3">
          <a
            href="https://www.instagram.com/hypsoindia/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:text-accent transition-colors"
          >
            Instagram
          </a>
        </div>
        <p className="text-xs text-muted mt-2">
          &copy; {new Date().getFullYear()} Marie Meister
        </p>
      </div>
    </aside>
  );
}
