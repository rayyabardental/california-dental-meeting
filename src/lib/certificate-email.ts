import { Resend } from "resend";
import { env } from "@/lib/env";
import type { CertificateRecord } from "@/lib/certificates";
import type { Course } from "@/lib/events-data";
import { buildCertificatePdf } from "@/lib/certificate-pdf";

/**
 * Emails a signed Certificate of Completion as a PDF attachment. Returns true
 * on success. Fails soft (returns false) if Resend isn't configured or the
 * send errors, so a batch send can record which certificates still need to go
 * out rather than throwing.
 */
export async function sendCertificateEmail(
  record: CertificateRecord,
  course: Course,
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  if (!course.certificate) return false;

  let pdf: Uint8Array;
  try {
    pdf = await buildCertificatePdf(record, course);
  } catch {
    return false;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const courseName = course.certificate.courseName;
  const filename = `CDM-Certificate-${record.certNumber}.pdf`;

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0d2340">
    <div style="background:#0d2340;padding:26px 30px;border-radius:16px 16px 0 0">
      <p style="margin:0;color:#d7a14a;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:700">
        California Dental Meeting
      </p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:21px;line-height:1.3">
        Your Certificate of Completion
      </h1>
    </div>
    <div style="border:1px solid #e6ebf1;border-top:none;border-radius:0 0 16px 16px;padding:26px 30px">
      <p style="margin:0 0 16px">Dear ${record.participantName},</p>
      <p style="margin:0 0 18px;line-height:1.6;color:#475569">
        Thank you for attending <strong>${courseName}</strong>. Your official
        Dental Board of California Certificate of Completion is attached to this
        email as a PDF. Please retain it for your continuing-education records.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:9px 0;color:#64748B">CE units</td>
          <td style="padding:9px 0;text-align:right;font-weight:600">${course.certificate.unitsEarned}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;color:#64748B;border-top:1px solid #eef2f6">Date of completion</td>
          <td style="padding:9px 0;text-align:right;font-weight:600;border-top:1px solid #eef2f6">${course.certificate.attendanceDateLabel}</td>
        </tr>
        <tr>
          <td style="padding:9px 0;color:#64748B;border-top:1px solid #eef2f6">Certificate no.</td>
          <td style="padding:9px 0;text-align:right;font-weight:600;border-top:1px solid #eef2f6">${record.certNumber}</td>
        </tr>
      </table>
      <p style="margin:22px 0 0;font-size:13px;color:#94a3b8">
        Questions? Reply to this email or contact California Dental Meeting at
        ray.yabardental@gmail.com.
      </p>
    </div>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: env.REGISTRATION_FROM_EMAIL,
      to: record.email,
      subject: `Your Certificate of Completion — ${courseName}`,
      html,
      attachments: [
        { filename, content: Buffer.from(pdf) },
      ],
    });
    return !error;
  } catch {
    return false;
  }
}
