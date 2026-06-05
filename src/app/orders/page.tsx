import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderLookup } from "@/components/sections/order-lookup";

export const metadata: Metadata = {
  title: "Order lookup",
  description:
    "Look up your California Dental Meeting registration by order number — no account required.",
};

export default function OrdersPage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <OrderLookup />
    </Suspense>
  );
}
