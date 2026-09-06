import { z } from "zod";

export const programSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  age_group: z.string().nullable(),
  level: z.string().nullable(),
  duration_minutes: z.number().int().positive().nullable(),
});

export const programsResponseSchema = z.array(programSchema);

export type Program = z.infer<typeof programSchema>;
