import { Resend } from "resend";
import { env } from "@/lib/env";
import { formatMoney } from "@/lib/checkout";

/**
 * Registration confirmation email, triggered from the Stripe webhook after a
 * payment succeeds. Fails soft — an email error must never surface to the
 * payer (their payment already succeeded) or throw inside the webhook.
 *
 * No payment details (card number, etc.) are ever included or stored here —
 * only the order summary built from PaymentIntent metadata.
 */
export type ConfirmationArgs = {
  email: string;
  firstName: string;
  lastName: string;
  courseTitle: string;
  courseDates: string;
  payMode: "full" | "deposit";
  amountPaidCents: number;
  balanceDueCents: number;
  currency: string;
};

function confirmationHtml(a: ConfirmationArgs): string {
  const paid = formatMoney(a.amountPaidCents, a.currency);
  const balance =
    a.balanceDueCents > 0 ? formatMoney(a.balanceDueCents, a.currency) : null;
  const modeLabel =
    a.payMode === "deposit" ? "Reservation deposit" : "Tuition (paid in full)";

  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A1A2E">
    <div style="background:#0A2540;padding:28px 32px;border-radius:16px 16px 0 0">
      <p style="margin:0;color:#C9A84C;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:700">
        California Dental Meeting
      </p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;line-height:1.3">
        Registration confirmed
      </h1>
    </div>
    <div style="border:1px solid #e6ebf1;border-top:none;border-radius:0 0 16px 16px;padding:28px 32px">
      <p style="margin:0 0 16px">Dear ${a.firstName} ${a.lastName},</p>
      <p style="margin:0 0 20px;line-height:1.6;color:#475569">
        Thank you for registering for <strong>${a.courseTitle}</strong>. Your
        payment has been received and your seat is reserved. Our enrollment
        team will be in touch with the full registration packet.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:10px 0;color:#64748B">Course</td>
          <td style="padding:10px 0;text-align:right;font-weight:600">${a.courseTitle}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748B;border-top:1px solid #eef2f6">Dates</td>
          <td style="padding:10px 0;text-align:right;font-weight:600;border-top:1px solid #eef2f6">${a.courseDates}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748B;border-top:1px solid #eef2f6">${modeLabel}</td>
          <td style="padding:10px 0;text-align:right;font-weight:700;border-top:1px solid #eef2f6">${paid}</td>
        </tr>
        ${
          balance
            ? `<tr>
                <td style="padding:10px 0;color:#64748B;border-top:1px solid #eef2f6">Balance due before course</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;border-top:1px solid #eef2f6">${balance}</td>
              </tr>`
            : ""
        }
      </table>
      ${
        balance
          ? `<p style="margin:20px 0 0;font-size:13px;color:#64748B;line-height:1.6">
              Your deposit reserves your place. The remaining balance of
              ${balance} will be collected by our enrollment team ahead of the
              course start date.
            </p>`
          : ""
      }
      <p style="margin:24px 0 0;font-size:13px;color:#94a3b8">
        Questions? Reply to this email or call +1 (951) 463-9732 —
        Ray Buelna &amp; Jacky Sanchez, Enrollment.
      </p>
    </div>
  </div>`;
}

export async function sendRegistrationConfirmation(
  args: ConfirmationArgs,
): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  const resend = new Resend(env.RESEND_API_KEY);
  const from = env.REGISTRATION_FROM_EMAIL;
  const html = confirmationHtml(args);
  const paid = formatMoney(args.amountPaidCents, args.currency);

  try {
    await resend.emails.send({
      from,
      to: args.email,
      subject: `Registration confirmed — ${args.courseTitle}`,
      html,
    });

    // Internal notification so staff see every registration in real time.
    if (env.CONTACT_TO_EMAIL) {
      await resend.emails.send({
        from,
        to: env.CONTACT_TO_EMAIL,
        subject: `New registration · ${args.courseTitle} · ${paid}`,
        html: `<div style="font-family:Inter,Arial,sans-serif">
          <h2>New course registration</h2>
          <p><strong>${args.firstName} ${args.lastName}</strong> (${args.email})</p>
          <p>${args.courseTitle} — ${args.courseDates}</p>
          <p>Paid today: <strong>${paid}</strong>${
            args.balanceDueCents > 0
              ? ` · Balance due: ${formatMoney(args.balanceDueCents, args.currency)}`
              : ""
          }</p>
          <p>Full record (with billing details) is in the Stripe Dashboard.</p>
        </div>`,
      });
    }
  } catch {
    // Soft-fail: payment already succeeded; never surface email errors.
  }
}
