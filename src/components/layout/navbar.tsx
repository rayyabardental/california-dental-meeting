"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { CdmLogo } from "@/components/ui/cdm-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Veracruz 2026", href: "#flagship" },
  { label: "Courses", href: "#courses" },
  { label: "Curriculum", href: "#curriculum" },
  { label: "Faculty", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export function Navbar(): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
          <Link
            href="/"
            className="group flex items-center gap-3 text-primary"
            aria-label="California Dental Meeting — home"
          >
            <CdmLogo size={48} priority className="transition-transform group-hover:scale-105" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-base font-semibold tracking-wider text-primary">
                CALIFORNIA DENTAL MEETING
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.28em] text-ink-muted">
                International Education · Clinical Excellence
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-primary/5 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="tel:+19514639732"
              className="hidden items-center gap-2 rounded-full border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary/40 md:inline-flex"
            >
              <Phone className="h-3.5 w-3.5 text-accent" />
              +1 (951) 463-9732
            </a>
            <Button
              variant="gold"
              size="md"
              href="#flagship"
              className="hidden md:inline-flex"
            >
              Reserve a spot
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="grid h-11 w-11 place-items-center rounded-full border border-primary/15 text-primary lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
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
                  <CdmLogo size={44} />
                  <span className="font-display text-sm font-semibold tracking-wider">
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
                className="flex flex-1 flex-col gap-2 px-6 pt-8"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {NAV_ITEMS.map((item) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="font-display text-3xl text-white"
                  >
                    {item.label}
                  </motion.a>
                ))}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="mt-8 space-y-3"
                >
                  <Button
                    variant="gold"
                    size="lg"
                    href="#flagship"
                    className="w-full"
                  >
                    Reserve a spot
                  </Button>
                  <a
                    href="tel:+19514639732"
                    className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white"
                  >
                    <Phone className="h-4 w-4 text-gold" />
                    +1 (951) 463-9732
                  </a>
                </motion.div>
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
