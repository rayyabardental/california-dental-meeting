import type { Metadata } from "next";
import { CartView } from "@/components/sections/cart-view";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your California Dental Meeting course registration.",
  // Transactional pages should not be indexed.
  robots: { index: false, follow: false },
};

export default function CartPage(): React.ReactElement {
  return <CartView />;
}
