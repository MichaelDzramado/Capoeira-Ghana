import { createClient } from "@/lib/supabase/server";

export async function getActivePrograms() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("programs")
    .select(
      "id, name, slug, description, age_group, level, duration_minutes",
    )
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch programs: ${error.message}`);
  }

  return data;
}
