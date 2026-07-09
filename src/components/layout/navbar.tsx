"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { CdmLogo } from "@/components/ui/cdm-logo";
import { cn } from "@/lib/utils";

/**
 * Primary navigation. Each item opens its own dedicated page — no anchor
 * scroll jumping. The logo links back to home.
 */
const NAV_ITEMS = [
  {
    label: "Veracruz",
    href: "/courses/basic-dental-implant-course-veracruz-2026",
  },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Order lookup", href: "/orders" },
] as const;

export function Navbar(): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close the mobile menu with Escape (WCAG 2.1 — keyboard dismissible).
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Close mobile menu on route change (e.g. browser back with menu open).
  // Deferred so setState isn't called synchronously in the effect body.
  useEffect(() => {
    const id = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Pick the *most specific* matching nav item so a deep route like
  // /courses/basic-dental-implant-course-veracruz-2026 highlights only the
  // "Veracruz" link, not also "Courses".
  const activeHref = ((): string | null => {
    if (!pathname) return null;
    const matches = NAV_ITEMS.filter(
      (item) =>
        pathname === item.href || pathname.startsWith(item.href + "/"),
    );
    if (matches.length === 0) return null;
    return matches.reduce((best, item) =>
      item.href.length > best.href.length ? item : best,
    ).href;
  })();

  const isActive = (href: string): boolean => href === activeHref;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "glass border-b border-primary/8 shadow-[0_1px_0_rgba(13,35,64,0.04)]"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:h-28 lg:px-10">
          <Link
            href="/"
            className="group flex items-center gap-4 text-primary"
            aria-label="California Dental Meeting — home"
          >
            <CdmLogo
              size={72}
              priority
              className="transition-transform group-hover:scale-105 ring-2 ring-primary/15 shadow-[0_10px_30px_-12px_rgba(13,35,64,0.35)]"
            />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-lg font-semibold tracking-wider text-primary sm:text-xl">
                CALIFORNIA DENTAL MEETING
              </span>
              <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-ink-muted">
                International Education · Clinical Excellence
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary/8 text-primary"
                    : "text-ink/80 hover:bg-primary/5 hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/courses"
              className={cn(
                "ml-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-gold px-5 text-sm font-semibold text-primary",
                "shadow-[0_8px_20px_-8px_rgba(215,161,74,0.6)] transition-all hover:bg-gold-300 hover:scale-[1.02] active:scale-[0.99]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              Enroll now
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="grid h-12 w-12 place-items-center rounded-full border border-primary/15 text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] gradient-mesh-dark lg:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-6 py-4">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-white"
                >
                  <CdmLogo size={56} />
                  <span className="font-display text-base font-semibold tracking-wider">
                    CDM
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <motion.nav
                aria-label="Mobile primary"
                className="flex flex-1 flex-col gap-2 px-6 pt-12"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {NAV_ITEMS.map((item) => (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "block py-1.5 font-display text-3xl transition-colors",
                        isActive(item.href) ? "text-gold" : "text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="mt-8"
                >
                  <Link
                    href="/courses"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-13 items-center gap-2 rounded-full bg-gold px-8 font-sans text-base font-semibold text-primary shadow-[0_8px_20px_-8px_rgba(215,161,74,0.6)]"
                  >
                    Enroll now
                  </Link>
                </motion.div>
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
