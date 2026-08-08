import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CertificateForm } from "@/components/sections/certificate-form";
import { EVENTS, findEvent } from "@/lib/events-data";

export const metadata: Metadata = {
  title: "Certificate of Completion",
  robots: { index: false, follow: false },
};

export default async function CertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}): Promise<React.ReactElement> {
  const { event } = await searchParams;
  const course = event ? findEvent(event) : undefined;
  const valid = course && course.certificate;

  return (
    <section className="relative min-h-screen gradient-mesh py-10 lg:py-14">
      <div className="pointer-events-none absolute -top-40 right-1/2 -z-10 h-[36rem] w-[36rem] translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <Container size="default">
        {valid ? (
          <CertificateForm course={course} />
        ) : (
          <div className="mx-auto max-w-lg rounded-3xl border border-primary/10 bg-white p-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold-600">
              <AlertCircle className="h-6 w-6" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-medium text-primary">
              Certificate not available
            </h1>
            <p className="mt-3 text-sm text-ink-muted text-pretty">
              This certificate link isn&apos;t valid for an active course.
              Please scan the QR code provided at your event&apos;s check-in
              table, or ask event staff for assistance.
            </p>
            {/* Available certificate courses — handy for staff testing on-site. */}
            {EVENTS.some((c) => c.certificate) && (
              <div className="mt-6 border-t border-primary/10 pt-5 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  Active certificate courses
                </p>
                <ul className="mt-3 space-y-2">
                  {EVENTS.filter((c) => c.certificate).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/certificate?event=${c.id}`}
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {c.certificate!.courseName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
