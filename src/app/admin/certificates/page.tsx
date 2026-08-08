import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Award, Clock, Send, Download, AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { AdminNav } from "@/components/sections/admin-nav";
import { LogoutButton } from "@/components/sections/admin-roster";
import {
  CertQrGenerator,
  DeleteCertButton,
  EmailNowButton,
  ExportCertsCsvButton,
  SendDueCertsButton,
  TestEmailButton,
  type CertRow,
} from "@/components/sections/admin-certificates";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { redisHealth } from "@/lib/redis";
import { listCertificates } from "@/lib/certificates";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Certificates",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmt(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export default async function AdminCertificatesPage(): Promise<React.ReactElement> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) redirect("/admin/login");

  const storage = await redisHealth();
  const certs = storage.reachable ? await listCertificates() : [];
  const pending = certs.filter((c) => c.status === "pending").length;
  const sent = certs.filter((c) => c.status === "sent").length;
  const emailReady = Boolean(env.RESEND_API_KEY);

  const rows: CertRow[] = certs.map((c) => ({
    certNumber: c.certNumber,
    courseTitle: c.courseTitle,
    participantName: c.participantName,
    licenseNumber: c.licenseNumber,
    email: c.email,
    status: c.status,
    signedDate: c.signedDate,
    sentDate: c.sentDate,
  }));

  return (
    <section className="relative bg-surface py-12 lg:py-16">
      <Container size="wide">
        <AdminNav />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
              Admin
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-primary md:text-4xl">
              Certificates of completion
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Every signed certificate, retained for recordkeeping. Certificates
              email automatically the day after each event concludes.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <TestEmailButton />
            <SendDueCertsButton />
            <ExportCertsCsvButton
              rows={rows}
              filename={`cdm-certificates-${new Date().toISOString().slice(0, 10)}.csv`}
            />
            <LogoutButton />
          </div>
        </div>

        {!emailReady && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-50/60 px-5 py-4 text-sm text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-gold-600" />
            <p>
              <strong>Email delivery isn&apos;t configured yet.</strong>{" "}
              Certificates are being collected and stored, but won&apos;t send
              until <code className="font-mono">RESEND_API_KEY</code> and a
              verified sender domain are set in Vercel. All pending certificates
              will go out on the next run once configured.
            </p>
          </div>
        )}

        {/* QR generator */}
        <div className="mt-8 rounded-3xl border border-primary/10 bg-white p-6">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600">
            <Award className="h-4 w-4" />
            Check-in QR code
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Print this and place it on the check-in table. Guests scan it to
            sign their certificate for the selected event.
          </p>
          <div className="mt-5">
            <CertQrGenerator />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Award className="h-4 w-4" />}
            label="Total signed"
            value={String(certs.length)}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            label="Pending send"
            value={String(pending)}
          />
          <StatCard
            icon={<Send className="h-4 w-4" />}
            label="Emailed"
            value={String(sent)}
          />
        </div>

        {/* Table */}
        {!storage.reachable ? (
          <div className="mt-8 rounded-3xl border border-red-300 bg-red-50 p-6 text-sm text-red-900">
            Certificate storage is unreachable ({storage.error ?? "unknown"}).
            Signed certificates cannot be listed until the database connection
            is restored.
          </div>
        ) : certs.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-primary/10 bg-white p-10 text-center text-ink-muted">
            No certificates yet. Signed certificates appear here as guests
            complete the check-in signing flow.
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-3xl border border-primary/10 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-primary/10 bg-sand-100 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Certificate</th>
                  <th className="px-5 py-3 font-semibold">Participant</th>
                  <th className="px-5 py-3 font-semibold">License #</th>
                  <th className="px-5 py-3 font-semibold">Signed</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/8">
                {certs.map((c) => (
                  <tr key={c.certNumber}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-primary">{c.certNumber}</p>
                      <p className="text-xs text-ink-muted">{c.courseTitle}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-primary">
                        {c.participantName}
                      </p>
                      <p className="text-xs text-ink-muted">{c.email}</p>
                    </td>
                    <td className="px-5 py-3 text-ink">{c.licenseNumber}</td>
                    <td className="px-5 py-3 text-ink-muted">
                      {fmt(c.signedDate)}
                    </td>
                    <td className="px-5 py-3">
                      {c.status === "sent" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-700">
                          Emailed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <a
                          href={`/api/admin/certificates/pdf?cert=${encodeURIComponent(c.certNumber)}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                        <EmailNowButton
                          certNumber={c.certNumber}
                          defaultEmail={c.email}
                        />
                        {c.status === "pending" && (
                          <DeleteCertButton certNumber={c.certNumber} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div className="rounded-3xl border border-primary/10 bg-white p-6">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        <span className="text-accent">{icon}</span>
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-medium text-primary">
        {value}
      </p>
    </div>
  );
}
