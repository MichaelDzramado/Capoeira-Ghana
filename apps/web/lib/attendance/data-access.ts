import { createClient } from "@/lib/supabase/server";

export async function getCurrentInstructorContext() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error("Unable to verify the current instructor session.");
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

export async function getInstructorClassIds(
  instructorProfileId: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("class_instructors")
    .select("class_id")
    .eq("instructor_id", instructorProfileId);

  if (error) {
    throw new Error(
      `Unable to load instructor classes: ${error.message}`,
    );
  }

  return data.map((row) => row.class_id);
}

export async function getInstructorSessions(
  instructorProfileId: string,
) {
  const supabase = await createClient();

  const classIds = await getInstructorClassIds(instructorProfileId);

  if (classIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("class_sessions")
    .select(`
      id,
      class_id,
      session_date,
      start_time,
      end_time,
      classes ( name )
    `)
    .in("class_id", classIds)
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(
      `Unable to load attendance sessions: ${error.message}`,
    );
  }

  return data;
}

export async function getAttendanceSession(
  sessionId: string,
  instructorProfileId: string,
) {
  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("class_sessions")
    .select(`
      id,
      class_id,
      session_date,
      start_time,
      end_time,
      classes ( id, name )
    `)
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return null;
  }

  const {
    data: instructorClass,
    error: instructorClassError,
  } = await supabase
    .from("class_instructors")
    .select("class_id")
    .eq("class_id", session.class_id)
    .eq("instructor_id", instructorProfileId)
    .maybeSingle();

  if (instructorClassError) {
    throw new Error(
      `Unable to verify class assignment: ${instructorClassError.message}`,
    );
  }

  if (!instructorClass) {
    return null;
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
      .eq("class_id", session.class_id)
      .eq("status", "active");

  if (enrollmentError) {
    throw new Error(
      `Unable to load active students: ${enrollmentError.message}`,
    );
  }

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("student_id, status, notes")
    .eq("session_id", sessionId);

  if (attendanceError) {
    throw new Error(
      `Unable to load attendance records: ${attendanceError.message}`,
    );
  }

  return {
    session,
    enrollments: enrollments ?? [],
    attendance: attendance ?? [],
  };
}

export async function saveAttendance(
  sessionId: string,
  instructorProfileId: string,
  records: {
    studentId: string;
    status: "present" | "absent" | "late" | "excused";
    notes?: string;
  }[],
) {
  const supabase = await createClient();

  const session = await getAttendanceSession(
    sessionId,
    instructorProfileId,
  );

  if (!session) {
    return null;
  }

  const allowedStudentIds = new Set(
    session.enrollments.map((enrollment) => enrollment.student_id),
  );

  const submittedStudentIds = new Set(
    records.map((record) => record.studentId),
  );

  if (submittedStudentIds.size !== records.length) {
    throw new Error("Duplicate students are not allowed.");
  }

  for (const record of records) {
    if (!allowedStudentIds.has(record.studentId)) {
      throw new Error(
        "Attendance can only be recorded for actively enrolled students.",
      );
    }
  }

  if (records.length !== allowedStudentIds.size) {
    throw new Error(
      "Attendance must include every actively enrolled student.",
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const rows = records.map((record) => ({
    session_id: sessionId,
    student_id: record.studentId,
    status: record.status,
    notes: record.notes?.trim() || null,
    recorded_by: user.id,
    recorded_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, {
      onConflict: "session_id,student_id",
    });

  if (error) {
    throw new Error(
      `Unable to save attendance: ${error.message}`,
    );
  }

  return getAttendanceSession(
    sessionId,
    instructorProfileId,
  );
}
