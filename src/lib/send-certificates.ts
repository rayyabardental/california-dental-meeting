import { env } from "@/lib/env";
import { findEvent } from "@/lib/events-data";
import {
  listCertificates,
  saveCertificate,
  type CertificateRecord,
} from "@/lib/certificates";
import { sendCertificateEmail } from "@/lib/certificate-email";

export type SendSummary = {
  configured: boolean;
  sent: string[];
  failed: string[];
  pendingNotYetDue: number;
};

/** True once the day of the course's end date has fully passed (UTC-safe). */
function hasConcluded(dateIso: string): boolean {
  const end = new Date(dateIso);
  if (Number.isNaN(end.getTime())) return false;
  // Boundary = 00:00 UTC the day AFTER the event date, so an event never has
  // certificates sent before it is over in any timezone.
  const boundary = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate() + 1,
  );
  return Date.now() >= boundary;
}

/**
 * Emails every pending certificate whose event has already concluded, marking
 * each one sent. Idempotent per certificate — a record already "sent" is
 * skipped, and a failed send stays "pending" for the next run.
 */
export async function sendDueCertificates(): Promise<SendSummary> {
  const configured = Boolean(env.RESEND_API_KEY);
  const summary: SendSummary = {
    configured,
    sent: [],
    failed: [],
    pendingNotYetDue: 0,
  };
  if (!configured) return summary;

  const certs = await listCertificates();
  for (const cert of certs) {
    if (cert.status === "sent") continue;
    const course = findEvent(cert.courseId);
    if (!course || !course.certificate) continue;

    const dueDate = course.endDate ?? course.date;
    if (!hasConcluded(dueDate)) {
      summary.pendingNotYetDue++;
      continue;
    }

    const ok = await sendCertificateEmail(cert, course);
    if (ok) {
      const updated: CertificateRecord = {
        ...cert,
        status: "sent",
        sentDate: new Date().toISOString(),
      };
      await saveCertificate(updated);
      summary.sent.push(cert.certNumber);
    } else {
      summary.failed.push(cert.certNumber);
    }
  }

  return summary;
}
