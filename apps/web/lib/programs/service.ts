import { getActivePrograms } from "./data-access";
import {
  programsResponseSchema,
  type Program,
} from "./schemas";

export async function listPrograms(): Promise<Program[]> {
  const programs = await getActivePrograms();

  return programsResponseSchema.parse(programs);
}
