import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import {
  InstagramIcon,
  LinkedInIcon,
} from "@/components/ui/social-icons";
import { CdmLogo } from "@/components/ui/cdm-logo";
import { Container } from "@/components/ui/container";

const FOOTER_LINKS: ReadonlyArray<{
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}> = [
  {
    title: "Programs",
    links: [
      {
        label: "Veracruz 2027 (flagship)",
        href: "/courses/basic-dental-implant-course-veracruz-2026",
      },
      {
        label: "Curriculum & schedule",
        href: "/courses/basic-dental-implant-course-veracruz-2026#curriculum",
      },
      {
        label: "What's included",
        href: "/courses/basic-dental-implant-course-veracruz-2026#included",
      },
      { label: "All courses", href: "/courses" },
    ],
  },
  {
    title: "Organization",
    links: [
      { label: "About CDM", href: "/about" },
      { label: "Team", href: "/about#team" },
      { label: "Credentials", href: "/about#credentials" },
      { label: "International partnerships", href: "/about#partnerships" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Enrollment", href: "/contact" },
      { label: "Order lookup", href: "/orders" },
      {
        label: "Continuing Education",
        href: "/courses/basic-dental-implant-course-veracruz-2026",
      },
      { label: "Sponsors", href: "/about#sponsors" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer(): React.ReactElement {
  return (
    <footer className="relative isolate overflow-hidden bg-primary text-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <Container size="wide" className="py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <div className="flex items-center gap-3">
              <CdmLogo size={56} className="ring-white/20" />
              <div>
                <p className="font-display text-xl font-semibold tracking-wider">
                  CALIFORNIA DENTAL MEETING
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/60">
                  International Education · Clinical Excellence
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-pretty text-white/70">
              An international continuing-education organization delivering
              live-patient surgical training in partnership with academic
              institutions across the Americas.
            </p>

            <div className="mt-7 space-y-2 text-sm text-white/80">
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <a href="tel:+19514639732" className="hover:text-white">
                  +1 (951) 463-9732
                </a>
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                <a
                  href="mailto:enrollment@californiadentalmeeting.com"
                  className="hover:text-white"
                >
                  enrollment@californiadentalmeeting.com
                </a>
              </p>
            </div>

            <div className="mt-7 flex items-center gap-3">
              {[
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: LinkedInIcon, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                  {col.title}
                </p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-white/75 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/55 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} California Dental Meeting (CDM).
            International Education · Clinical Excellence · Innovation.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/code-of-conduct" className="hover:text-white">
              Code of Conduct
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
