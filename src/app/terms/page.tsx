import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for registering for and participating in California Dental Meeting continuing-education programs.",
};

export default function TermsPage(): React.ReactElement {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="These terms govern registration for and participation in California Dental Meeting (CDM) continuing-education programs."
      updated="June 2026"
      note="This page summarizes CDM's standard registration terms. Binding terms specific to your jurisdiction should be reviewed and finalized by CDM's legal counsel."
      sections={[
        {
          heading: "Registration & Eligibility",
          paragraphs: [
            "Registration is open to the dental professionals described in our CE Policies. Participation is subject to applicable state regulations and scope-of-practice requirements.",
          ],
        },
        {
          heading: "Fees & Payment",
          paragraphs: [
            "Course fees are stated at the point of registration and charged at checkout. Payments are processed securely by our payment providers, Stripe and PayPal — California Dental Meeting does not collect or store your card details.",
          ],
        },
        {
          heading: "Refunds & Cancellations",
          paragraphs: [
            "Refund requests must be submitted in writing prior to the scheduled event date. Refund eligibility, deadlines, and processing procedures will be provided during registration.",
            "If California Dental Meeting reschedules or cancels a program, registrants will be notified and offered a transfer or refund.",
          ],
        },
        {
          heading: "Continuing Education Credit",
          paragraphs: [
            "Certificates of completion are issued only after attendance has been verified, in accordance with our CE Policies. Continuing-education credits are awarded based on verified participation and compliance with attendance and evaluation requirements.",
          ],
        },
        {
          heading: "Participant Conduct",
          paragraphs: [
            "All participants are expected to follow CDM's Code of Conduct, including all clinical, safety, and supervision protocols where a program involves patient care.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            "[Placeholder — limitation of liability and indemnification terms to be finalized by CDM's legal counsel.]",
          ],
        },
        {
          heading: "Changes to These Terms",
          paragraphs: [
            "California Dental Meeting may update these terms from time to time. The current version is always posted on this page.",
          ],
        },
      ]}
    />
  );
}
