import { z } from "zod";

export const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "excused",
]);

export const attendanceRecordSchema = z.object({
  studentId: z.string().uuid(),
  status: attendanceStatusSchema,
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const updateAttendanceSchema = z.object({
  attendance: z.array(attendanceRecordSchema),
});

export const attendanceSessionSchema = z.object({
  id: z.string().uuid(),
  classId: z.string().uuid(),
  className: z.string(),
  sessionDate: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

export const attendanceStudentSchema = z.object({
  studentId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  status: attendanceStatusSchema.nullable(),
  notes: z.string().nullable(),
});

export const attendanceRosterSchema = z.object({
  session: attendanceSessionSchema,
  students: z.array(attendanceStudentSchema),
});

export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
