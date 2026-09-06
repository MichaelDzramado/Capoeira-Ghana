import { z } from "zod";

const databaseIdSchema = z.string().min(1);

const locationSchema = z.object({
  id: databaseIdSchema,
  name: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
});

const programSchema = z.object({
  id: databaseIdSchema,
  name: z.string(),
  slug: z.string(),
});

const instructorProfileSchema = z.object({
  id: databaseIdSchema,
  bio: z.string().nullable(),
});

const classInstructorSchema = z.object({
  instructor_profiles: instructorProfileSchema.nullable(),
});

export const classSchema = z.object({
  id: databaseIdSchema,
  name: z.string(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  capacity: z.number().int().positive().nullable(),
  programs: programSchema.nullable(),
  locations: locationSchema.nullable(),
  class_instructors: z.array(classInstructorSchema),
});

export const classesResponseSchema = z.array(classSchema);

export type Class = z.infer<typeof classSchema>;
export type Location = z.infer<typeof locationSchema>;
export type ProgramSummary = z.infer<typeof programSchema>;
