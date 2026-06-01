import { z } from "zod";

/**
 * Registrant + order details accepted by the create-payment-intent route.
 * Deliberately contains NO card data — card details are tokenized directly
 * by Stripe.js in the browser and never sent to our server.
 */
export const CheckoutSchema = z.object({
  courseId: z.string().min(1, "Missing course"),
  payMode: z.enum(["full", "deposit"]),
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  license: z.string().trim().max(80).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
