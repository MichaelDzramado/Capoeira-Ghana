import { z } from "zod";

export const createTrialBookingSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254, "Email address is too long."),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),

  age: z
    .number()
    .int("Age must be a whole number.")
    .min(0, "Age cannot be negative.")
    .max(120, "Please enter a valid age.")
    .optional(),

  programId: z
    .string()
    .uuid("Invalid program.")
    .optional()
    .or(z.literal("")),

  classId: z
    .string()
    .min(1, "Invalid class.")
    .optional()
    .or(z.literal("")),

  preferredDate: z
    .string()
    .date("Please enter a valid preferred date.")
    .optional()
    .or(z.literal("")),

  message: z
    .string()
    .trim()
    .max(1000, "Message is too long.")
    .optional()
    .or(z.literal("")),
});

export type CreateTrialBookingInput = z.infer<
  typeof createTrialBookingSchema
>;

export const trialBookingResponseSchema = z.object({
  id: z.string().min(1),
  student_name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  age: z.number().int().nullable(),
  program_id: z.string().nullable(),
  class_id: z.string().nullable(),
  preferred_date: z.string().nullable(),
  status: z.enum([
    "pending",
    "confirmed",
    "attended",
    "converted",
    "cancelled",
  ]),
  booked_at: z.string(),
  created_at: z.string(),
});
