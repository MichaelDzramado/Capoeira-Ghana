import { createClient } from "@/lib/supabase/server";

export async function getCurrentInstructorContext() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      "Unable to verify the current instructor session.",
    );
  }

  if (!user) {
    return null;
  }

  const { data: isInstructor, error: roleError } =
    await supabase.rpc("is_instructor");

  if (roleError) {
    throw new Error(
      `Unable to verify instructor role: ${roleError.message}`,
    );
  }

  if (!isInstructor) {
    return null;
  }

  const { data: instructorProfile, error: instructorError } =
    await supabase
      .from("instructor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

  if (instructorError || !instructorProfile) {
    return null;
  }

  const { data: ownsProfile, error: ownershipError } =
    await supabase.rpc("is_current_instructor", {
      target_instructor_id: instructorProfile.id,
    });

  if (ownershipError) {
    throw new Error(
      `Unable to verify instructor profile: ${ownershipError.message}`,
    );
  }

  if (!ownsProfile) {
    return null;
  }

  return {
    userId: user.id,
    instructorProfileId: instructorProfile.id,
  };
}

export async function getInstructorStudents(
  instructorProfileId: string,
) {
  const supabase = await createClient();

  const { data: classAssignments, error: assignmentError } =
    await supabase
      .from("class_instructors")
      .select("class_id")
      .eq("instructor_id", instructorProfileId);

  if (assignmentError) {
    throw new Error(
      `Unable to load instructor classes: ${assignmentError.message}`,
    );
  }

  const classIds = classAssignments.map(
    (assignment) => assignment.class_id,
  );

  if (classIds.length === 0) {
    return [];
  }

  const { data: enrollments, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select(`
        student_id,
        student_profiles (
          id,
          user_id,
          users (
            first_name,
            last_name
          )
        )
      `)
      .in("class_id", classIds)
      .eq("status", "active");

  if (enrollmentError) {
    throw new Error(
      `Unable to load instructor students: ${enrollmentError.message}`,
    );
  }

  const uniqueStudents = new Map();

  for (const enrollment of enrollments ?? []) {
    const profile = Array.isArray(enrollment.student_profiles)
      ? enrollment.student_profiles[0] ?? null
      : enrollment.student_profiles;

    if (!profile) {
      continue;
    }

    const user = Array.isArray(profile.users)
      ? profile.users[0] ?? null
      : profile.users;

    uniqueStudents.set(enrollment.student_id, {
      student_id: enrollment.student_id,
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
    });
  }

  return Array.from(uniqueStudents.values()).sort(
    (a, b) =>
      `${a.first_name} ${a.last_name}`.localeCompare(
        `${b.first_name} ${b.last_name}`,
      ),
  );
}

export async function getStudentProgression(
  studentId: string,
  instructorProfileId: string,
) {
  const supabase = await createClient();

  const { data: enrollments, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select("class_id")
      .eq("student_id", studentId)
      .eq("status", "active");

  if (enrollmentError) {
    throw new Error(
      `Unable to verify student access: ${enrollmentError.message}`,
    );
  }

  const classIds = (enrollments ?? []).map(
    (enrollment) => enrollment.class_id,
  );

  if (classIds.length === 0) {
    return null;
  }

  const { data: instructorAssignment, error: assignmentError } =
    await supabase
      .from("class_instructors")
      .select("class_id")
      .in("class_id", classIds)
      .eq("instructor_id", instructorProfileId)
      .limit(1)
      .maybeSingle();

  if (assignmentError) {
    throw new Error(
      `Unable to verify student access: ${assignmentError.message}`,
    );
  }

  if (!instructorAssignment) {
    return null;
  }

  const { data: studentProfile, error: studentError } =
    await supabase
      .from("student_profiles")
      .select(`
        id,
        user_id,
        users (
          first_name,
          last_name
        )
      `)
      .eq("id", studentId)
      .single();

  if (studentError || !studentProfile) {
    return null;
  }

  const studentUser = Array.isArray(studentProfile.users)
    ? studentProfile.users[0] ?? null
    : studentProfile.users;

  const { data: progress, error: progressError } =
    await supabase
      .from("student_progress")
      .select(`
        id,
        student_id,
        current_belt_id,
        notes,
        updated_at,
        belts (
          id,
          name,
          rank_order,
          description
        )
      `)
      .eq("student_id", studentId)
      .maybeSingle();

  if (progressError) {
    throw new Error(
      `Unable to load student progress: ${progressError.message}`,
    );
  }

  const { data: belts, error: beltsError } = await supabase
    .from("belts")
    .select(`
      id,
      name,
      rank_order,
      description
    `)
    .order("rank_order", { ascending: true });

  if (beltsError) {
    throw new Error(
      `Unable to load belts: ${beltsError.message}`,
    );
  }

  const { data: history, error: historyError } =
    await supabase
      .from("belt_history")
      .select(`
        id,
        belt_id,
        awarded_at,
        awarded_by,
        notes,
        belts (
          name,
          rank_order
        )
      `)
      .eq("student_id", studentId)
      .order("awarded_at", { ascending: false })
      .order("created_at", { ascending: false });

  if (historyError) {
    throw new Error(
      `Unable to load belt history: ${historyError.message}`,
    );
  }

  return {
    student: {
      student_id: studentProfile.id,
      first_name: studentUser?.first_name ?? "",
      last_name: studentUser?.last_name ?? "",
    },
    progress: progress ?? null,
    belts: belts ?? [],
    history: history ?? [],
  };
}

export async function awardStudentBelt(
  studentId: string,
  beltId: string,
  notes: string | null,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "award_student_belt",
    {
      target_student_id: studentId,
      target_belt_id: beltId,
      progression_notes: notes,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
