import type { Metadata } from "next";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the California Dental Meeting enrollment team. Reserve your seat for the Veracruz cohort or request the tuition schedule. Ray Buelna & Jacky Sanchez respond within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact · California Dental Meeting",
    description:
      "Contact the CDM enrollment team to reserve a seat for the Veracruz cohort.",
    url: "/contact",
  },
};

export default function ContactPage(): React.ReactElement {
  return <Contact />;
}
