"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import type { PurchasableCourse, PayMode } from "@/lib/checkout";

type Registrant = {
  firstName: string;
  lastName: string;
  email: string;
  license?: string;
};

/**
 * Native PayPal button. Renders only when NEXT_PUBLIC_PAYPAL_CLIENT_ID is set,
 * so the card-only checkout is unaffected until PayPal credentials exist.
 * The amount is created and captured server-side; no payment data touches us.
 */
export function PayPalSection({
  course,
  payMode,
  registrant,
}: {
  course: PurchasableCourse;
  payMode: PayMode;
  registrant: Registrant;
}): React.ReactElement | null {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (!clientId) return null;

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        <span className="h-px flex-1 bg-primary/10" />
        or pay with PayPal
        <span className="h-px flex-1 bg-primary/10" />
      </div>

      <PayPalScriptProvider
        options={{
          clientId,
          currency: course.purchase.currency.toUpperCase(),
          intent: "capture",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", shape: "pill", label: "paypal" }}
          createOrder={async () => {
            setError(null);
            const res = await fetch("/api/checkout/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ courseId: course.id, payMode }),
            });
            const json = (await res.json()) as {
              data: { orderId: string } | null;
              error: string | null;
            };
            if (!json.data?.orderId) {
              throw new Error(json.error ?? "Could not start PayPal checkout.");
            }
            return json.data.orderId;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/checkout/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderID,
                courseId: course.id,
                payMode,
                ...registrant,
              }),
            });
            const json = (await res.json()) as { error: string | null };
            if (!res.ok || json.error) {
              setError(json.error ?? "PayPal payment could not be completed.");
              return;
            }
            router.push(`/checkout/success?paypal_order=${data.orderID}`);
          }}
          onError={() => setError("PayPal encountered an error. Please try again.")}
        />
      </PayPalScriptProvider>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Lightweight loading placeholder while the PayPal SDK script loads. */
export function PayPalLoading(): React.ReactElement {
  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading PayPal…
    </div>
  );
}
