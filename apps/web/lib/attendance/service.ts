import {
  getAttendanceSession,
  getInstructorSessions,
  getCurrentInstructorContext,
  saveAttendance,
} from "./data-access";

import {
  attendanceRosterSchema,
  attendanceSessionSchema,
  updateAttendanceSchema,
  type UpdateAttendanceInput,
} from "./schemas";

function mapSession(session: {
  id: string;
  class_id: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  classes:
    | { name: string }[]
    | { name: string }
    | null;
}) {
  const classData = Array.isArray(session.classes)
    ? session.classes[0] ?? null
    : session.classes;

  return {
    id: session.id,
    classId: session.class_id,
    className: classData?.name ?? "Unknown class",
    sessionDate: session.session_date,
    startTime: session.start_time,
    endTime: session.end_time,
  };
}

export async function listInstructorAttendanceSessions() {
  const instructor = await getCurrentInstructorContext();

  if (!instructor) {
    throw new Error("Unauthorized.");
  }

  const sessions = await getInstructorSessions(
    instructor.instructorProfileId,
  );

  return sessions
    .map(mapSession)
    .map((session) => attendanceSessionSchema.parse(session));
}

export async function getInstructorAttendanceRoster(
  sessionId: string,
) {
  const instructor = await getCurrentInstructorContext();

  if (!instructor) {
    throw new Error("Unauthorized.");
  }

  const result = await getAttendanceSession(
    sessionId,
    instructor.instructorProfileId,
  );

  if (!result) {
    return null;
  }

  const attendanceByStudent = new Map(
    result.attendance.map((record) => [
      record.student_id,
      {
        status: record.status,
        notes: record.notes,
      },
    ]),
  );

  const students = result.enrollments.map((enrollment) => {
    const profile = Array.isArray(enrollment.student_profiles)
      ? enrollment.student_profiles[0] ?? null
      : enrollment.student_profiles;

    const user = profile
      ? Array.isArray(profile.users)
        ? profile.users[0] ?? null
        : profile.users
      : null;

    const existing = attendanceByStudent.get(
      enrollment.student_id,
    );

    return {
      studentId: enrollment.student_id,
      firstName: user?.first_name ?? "",
      lastName: user?.last_name ?? "",
      status: existing?.status ?? null,
      notes: existing?.notes ?? null,
    };
  });

  return attendanceRosterSchema.parse({
    session: mapSession(result.session),
    students,
  });
}

export async function updateInstructorAttendance(
  sessionId: string,
  input: UpdateAttendanceInput,
) {
  const validated = updateAttendanceSchema.parse(input);

  const instructor = await getCurrentInstructorContext();

  if (!instructor) {
    throw new Error("Unauthorized.");
  }

  const result = await saveAttendance(
    sessionId,
    instructor.instructorProfileId,
    validated.attendance,
  );

  if (!result) {
    return null;
  }

  return getInstructorAttendanceRoster(sessionId);
}
