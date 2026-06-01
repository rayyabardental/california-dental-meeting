import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/sections/checkout-flow";

export const metadata: Metadata = {
  title: "Secure checkout",
  description: "Complete your California Dental Meeting course registration.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage(): React.ReactElement {
  return <CheckoutFlow />;
}
