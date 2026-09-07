import { z } from "zod";

export const studentProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name is required.")
    .max(80, "First name is too long."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name is required.")
    .max(80, "Last name is too long."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Please enter a valid date of birth.",
    ),
  emergencyContactName: z
    .string()
    .trim()
    .max(120, "Emergency contact name is too long.")
    .optional()
    .or(z.literal("")),
  emergencyContactPhone: z
    .string()
    .trim()
    .max(30, "Emergency contact phone is too long.")
    .optional()
    .or(z.literal("")),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
