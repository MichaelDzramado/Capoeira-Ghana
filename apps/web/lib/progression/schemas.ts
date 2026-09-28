import { z } from "zod";

export const progressionBeltSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  rankOrder: z.number().int().positive(),
  description: z.string().nullable(),
});

export const progressionStudentSchema = z.object({
  studentId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
});

export const progressionHistoryItemSchema = z.object({
  id: z.string().uuid(),
  beltId: z.string().uuid(),
  beltName: z.string(),
  rankOrder: z.number().int().positive(),
  awardedAt: z.string(),
  awardedBy: z.string().nullable(),
  notes: z.string().nullable(),
});

export const studentProgressSchema = z.object({
  id: z.string().uuid().nullable(),
  studentId: z.string().uuid(),
  currentBeltId: z.string().uuid().nullable(),
  currentBeltName: z.string().nullable(),
  currentBeltRank: z.number().int().positive().nullable(),
  currentBeltDescription: z.string().nullable(),
  notes: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const progressionStudentDetailSchema = z.object({
  student: progressionStudentSchema,
  progress: studentProgressSchema,
  belts: z.array(progressionBeltSchema),
  history: z.array(progressionHistoryItemSchema),
});

export const updateStudentProgressSchema = z.object({
  beltId: z.string().uuid(),
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),
});

export type ProgressionBelt = z.infer<
  typeof progressionBeltSchema
>;

export type ProgressionStudent = z.infer<
  typeof progressionStudentSchema
>;

export type ProgressionHistoryItem = z.infer<
  typeof progressionHistoryItemSchema
>;

export type StudentProgress = z.infer<
  typeof studentProgressSchema
>;

export type ProgressionStudentDetail = z.infer<
  typeof progressionStudentDetailSchema
>;

export type UpdateStudentProgressInput = z.infer<
  typeof updateStudentProgressSchema
>;
