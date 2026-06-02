import { env } from "@/lib/env";
import {
  type PurchasableCourse,
  type PayMode,
  amountDueTodayCents,
} from "@/lib/checkout";

/**
 * Minimal PayPal Orders v2 server client (REST, via fetch). Like the Stripe
 * integration, the charged amount is always computed server-side and PayPal
 * enforces that the captured amount equals the created order — a tampered
 * client can't change the price. No card data ever touches our server; PayPal
 * handles the entire payment UI in its own popup/iframe.
 */

const clientId = env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const clientSecret = env.PAYPAL_CLIENT_SECRET;

export function isPayPalConfigured(): boolean {
  return Boolean(clientId && clientSecret);
}

function apiBase(): string {
  return env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function accessToken(): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal token failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export type PayPalRegistrant = {
  firstName: string;
  lastName: string;
  email: string;
  license?: string;
};

/** Create a PayPal order for the chosen course + payment mode. Returns the
 *  order id the browser SDK needs to launch the approval flow. */
export async function createPayPalOrder(
  course: PurchasableCourse,
  payMode: PayMode,
): Promise<string> {
  const token = await accessToken();
  const cents = amountDueTodayCents(course, payMode);
  const value = (cents / 100).toFixed(2);

  const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          // custom_id lets us cross-check the order on capture (max 127 chars).
          custom_id: `${course.id}:${payMode}`,
          description:
            `${course.title} — ${payMode === "deposit" ? "Deposit" : "Full payment"}`.slice(
              0,
              127,
            ),
          amount: {
            currency_code: course.purchase.currency.toUpperCase(),
            value,
          },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`PayPal create order failed: ${res.status}`);
  const json = (await res.json()) as { id: string };
  return json.id;
}

export type PayPalCapture = {
  status: string;
  amountCents: number;
  currency: string;
  customId: string | null;
};

/** Capture an approved order. Returns the final status + captured amount. */
export async function capturePayPalOrder(
  orderId: string,
): Promise<PayPalCapture> {
  const token = await accessToken();
  const res = await fetch(
    `${apiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) throw new Error(`PayPal capture failed: ${res.status}`);
  return parseOrder(await res.json());
}

/** Read an order (used by the success page to show the order summary). */
export async function getPayPalOrder(orderId: string): Promise<PayPalCapture> {
  const token = await accessToken();
  const res = await fetch(`${apiBase()}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`PayPal get order failed: ${res.status}`);
  return parseOrder(await res.json());
}

type PayPalOrderResponse = {
  status: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { value?: string; currency_code?: string };
    payments?: {
      captures?: Array<{
        amount?: { value?: string; currency_code?: string };
      }>;
    };
  }>;
};

function parseOrder(data: PayPalOrderResponse): PayPalCapture {
  const unit = data.purchase_units?.[0];
  const captured = unit?.payments?.captures?.[0]?.amount ?? unit?.amount;
  const value = captured?.value ?? "0";
  return {
    status: data.status,
    amountCents: Math.round(parseFloat(value) * 100),
    currency: (captured?.currency_code ?? "USD").toLowerCase(),
    customId: unit?.custom_id ?? null,
  };
}
