"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * Wraps page content with the site navbar + footer, except on the isolated
 * certificate-signing flow, which renders chromeless so it reads as a
 * standalone kiosk rather than part of the marketing site.
 */
export function SiteFrame({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const bare = pathname?.startsWith("/certificate") ?? false;

  return (
    <>
      {!bare && <Navbar />}
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      {!bare && <Footer />}
    </>
  );
}
