import {
  awardStudentBelt,
  getCurrentInstructorContext,
  getInstructorStudents,
  getStudentProgression,
} from "./data-access";

import {
  progressionHistoryItemSchema,
  progressionStudentDetailSchema,
  progressionStudentSchema,
  studentProgressSchema,
  updateStudentProgressSchema,
} from "./schemas";

export async function listInstructorProgressionStudents() {
  const instructor = await getCurrentInstructorContext();

  if (!instructor) {
    throw new Error("Unauthorized.");
  }

  const students = await getInstructorStudents(
    instructor.instructorProfileId,
  );

  return students.map((student) =>
    progressionStudentSchema.parse({
      studentId: student.student_id,
      firstName: student.first_name,
      lastName: student.last_name,
    }),
  );
}

export async function getInstructorStudentProgression(
  studentId: string,
) {
  const instructor = await getCurrentInstructorContext();

  if (!instructor) {
    throw new Error("Unauthorized.");
  }

  const result = await getStudentProgression(
    studentId,
    instructor.instructorProfileId,
  );

  if (!result) {
    return null;
  }

  const belt = Array.isArray(result.progress?.belts)
    ? result.progress.belts[0] ?? null
    : result.progress?.belts ?? null;

  const progress = studentProgressSchema.parse({
    id: result.progress?.id ?? null,
    studentId: result.student.student_id,
    currentBeltId:
      result.progress?.current_belt_id ?? null,
    currentBeltName: belt?.name ?? null,
    currentBeltRank: belt?.rank_order ?? null,
    currentBeltDescription:
      belt?.description ?? null,
    notes: result.progress?.notes ?? null,
    updatedAt: result.progress?.updated_at ?? null,
  });

  const belts = result.belts.map((belt) => ({
    id: belt.id,
    name: belt.name,
    rankOrder: belt.rank_order,
    description: belt.description,
  }));

  const history = result.history.map((item) => {
    const beltData = Array.isArray(item.belts)
      ? item.belts[0] ?? null
      : item.belts;

    return progressionHistoryItemSchema.parse({
      id: item.id,
      beltId: item.belt_id,
      beltName: beltData?.name ?? "Unknown belt",
      rankOrder: beltData?.rank_order ?? 0,
      awardedAt: item.awarded_at,
      awardedBy: item.awarded_by,
      notes: item.notes,
    });
  });

  return progressionStudentDetailSchema.parse({
    student: {
      studentId: result.student.student_id,
      firstName: result.student.first_name,
      lastName: result.student.last_name,
    },
    progress,
    belts,
    history,
  });
}

export async function updateInstructorStudentProgression(
  studentId: string,
  input: unknown,
) {
  const validated =
    updateStudentProgressSchema.parse(input);

  const instructor = await getCurrentInstructorContext();

  if (!instructor) {
    throw new Error("Unauthorized.");
  }

  const result = await getStudentProgression(
    studentId,
    instructor.instructorProfileId,
  );

  if (!result) {
    return null;
  }

  const notes =
    validated.notes?.trim() || null;

  await awardStudentBelt(
    studentId,
    validated.beltId,
    notes,
  );

  return getInstructorStudentProgression(studentId);
}
