import { createClient } from "@/lib/supabase/server";

export async function getActiveClasses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select(`
      id,
      name,
      day_of_week,
      start_time,
      end_time,
      capacity,
      programs (
        id,
        name,
        slug
      ),
      locations (
        id,
        name,
        address,
        city,
        region
      ),
      class_instructors (
        instructor_profiles (
          id,
          bio
        )
      )
    `)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch classes: ${error.message}`);
  }

  return data;
}
