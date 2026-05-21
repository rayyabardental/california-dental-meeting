import { z } from "zod";

export const EventTypeSchema = z.enum([
  "CALIFORNIA",
  "NATIONAL",
  "INTERNATIONAL",
]);
export type EventTypeValue = z.infer<typeof EventTypeSchema>;

export const EventQuerySchema = z.object({
  region: EventTypeSchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const RegistrationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(60, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(60, "Last name is too long"),
  email: z.string().email("Please enter a valid email"),
  license: z
    .string()
    .max(40, "License number is too long")
    .optional()
    .or(z.literal("")),
});
export type RegistrationInput = z.infer<typeof RegistrationSchema>;

export const NewsletterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  consent: z.boolean().optional(),
});
export type NewsletterInput = z.infer<typeof NewsletterSchema>;

export const ContactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  organization: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10).max(2000),
});
export type ContactInput = z.infer<typeof ContactSchema>;
