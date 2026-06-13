import type { Metadata, Viewport } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/providers/query-provider";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "California Dental Meeting — International Education · Clinical Excellence · Innovation",
    template: "%s · California Dental Meeting",
  },
  description:
    "California Dental Meeting (CDM) is an international continuing-education organization founded and directed by Dr. Wilmer Yabar, delivering live-patient surgical training and clinical excellence programs in partnership with academic institutions across the Americas, Asia, and Europe.",
  keywords: [
    "California Dental Meeting",
    "CDM",
    "dental implant course",
    "live patient surgery",
    "Veracruz dental course",
    "Universidad CEYESOV",
    "Dr. Wilmer Yabar",
    "Dr. Jaime Franco",
    "IDES Kerala",
    "SIDHE Shenzhen",
    "ISADe",
    "FDILA",
    "continuing dental education",
    "implantology training",
  ],
  openGraph: {
    type: "website",
    siteName: "California Dental Meeting",
    title: "California Dental Meeting",
    description:
      "Live-patient implant surgery training in Veracruz, Mexico. 35 CE credits, 15–20 implants placed per participant.",
    url: SITE_URL,
    locale: "en_US",
    images: [{ url: "/cdm-logo.jpg", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "California Dental Meeting",
    description:
      "Live-patient implant surgery training in Veracruz, Mexico. 35 CE credits.",
    images: ["/cdm-logo.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/cdm-logo.jpg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0d2340" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-ink">
        <QueryProvider>
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <Navbar />
          <main id="main" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "font-sans !rounded-xl !border-primary/10",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
