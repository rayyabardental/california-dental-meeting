import type { Metadata } from "next";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the California Dental Meeting enrollment team. Reserve your seat for SIDHE 2026 in Shenzhen (December 9–11) or any upcoming program. Ray Buelna & Jacky Sanchez respond within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact · California Dental Meeting",
    description:
      "Contact the CDM enrollment team to reserve a seat for SIDHE 2026 in Shenzhen, or any upcoming program.",
    url: "/contact",
  },
};

export default function ContactPage(): React.ReactElement {
  return <Contact />;
}
