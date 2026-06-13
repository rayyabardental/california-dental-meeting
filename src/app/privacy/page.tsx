import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How California Dental Meeting collects, uses, and protects your personal information.",
};

export default function PrivacyPage(): React.ReactElement {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="How California Dental Meeting (CDM) collects, uses, and protects your information."
      updated="June 2026"
      note="This page describes CDM's current data practices. It should be reviewed by counsel to confirm compliance with the privacy laws applicable to your participants."
      sections={[
        {
          heading: "Information We Collect",
          paragraphs: [
            "When you register for a program we collect your name, email address, and — optionally — your dental license number.",
          ],
        },
        {
          heading: "Payment Information",
          paragraphs: [
            "Payments are processed by Stripe and PayPal. Card details are entered directly with the payment processor over an encrypted connection and are never collected or stored by California Dental Meeting.",
          ],
        },
        {
          heading: "How We Use Your Information",
          bullets: [
            "To process your registration and payment.",
            "To issue your order confirmation and certificate of completion.",
            "To send you program-related communications.",
            "To add you to our announcements list (see below).",
          ],
        },
        {
          heading: "Email & Announcements",
          paragraphs: [
            "With your registration you may be added to our mailing list (managed through Constant Contact) for program announcements. You can unsubscribe at any time using the link in any email.",
          ],
        },
        {
          heading: "Order Records",
          paragraphs: [
            "We retain order details — order number, course, amount paid, and purchase date — so that you can look up your registration at any time using your order number. We do not store any payment-card data.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "Our website uses only the essential cookies required for checkout and security.",
          ],
        },
        {
          heading: "Data Sharing",
          paragraphs: [
            "We share your information only with the service providers needed to deliver the program — our payment processors and email provider — and we never sell your data.",
          ],
        },
        {
          heading: "Your Choices",
          paragraphs: [
            "To request access to, correction of, or deletion of your information, contact us using the email below.",
          ],
        },
      ]}
    />
  );
}
