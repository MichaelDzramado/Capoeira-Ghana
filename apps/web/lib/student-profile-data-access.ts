import { createClient } from "@/lib/supabase/server";
import type { StudentProfileInput } from "./student-profile-schema";

export async function getCurrentStudentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error("Unable to verify the current student session.");
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select(
      `
        id,
        email,
        first_name,
        last_name,
        phone,
        status,
        student_profiles (
          id,
          date_of_birth,
          emergency_contact_name,
          emergency_contact_phone,
          joined_at,
          created_at,
          updated_at
        )
      `,
    )
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Unable to load student profile: ${error.message}`);
  }

  const profile = Array.isArray(data.student_profiles)
    ? data.student_profiles[0] ?? null
    : data.student_profiles;

  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone ?? "",
    status: data.status,
    studentProfile: profile,
  };
}

export async function updateCurrentStudentProfile(
  input: StudentProfileInput,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized.");
  }

  const { error: userUpdateError } = await supabase
    .from("users")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (userUpdateError) {
    throw new Error(
      `Unable to update student information: ${userUpdateError.message}`,
    );
  }

  const { error: profileUpdateError } = await supabase
    .from("student_profiles")
    .update({
      date_of_birth: input.dateOfBirth || null,
      emergency_contact_name: input.emergencyContactName || null,
      emergency_contact_phone: input.emergencyContactPhone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (profileUpdateError) {
    throw new Error(
      `Unable to update student profile: ${profileUpdateError.message}`,
    );
  }

  return getCurrentStudentProfile();
}
