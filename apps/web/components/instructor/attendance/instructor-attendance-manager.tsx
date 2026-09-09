"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@capoeira-ghana/ui";

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

type AttendanceSession = {
  id: string;
  classId: string;
  className: string;
  sessionDate: string;
  startTime: string | null;
  endTime: string | null;
};

type AttendanceStudent = {
  studentId: string;
  firstName: string;
  lastName: string;
  status: AttendanceStatus | null;
  notes: string | null;
};

type AttendanceRoster = {
  session: AttendanceSession;
  students: AttendanceStudent[];
};

type StudentAttendance = {
  status: AttendanceStatus | null;
  notes: string;
};

const STATUS_OPTIONS: Array<{
  value: AttendanceStatus;
  label: string;
}> = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

function formatSessionDate(date: string) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "full",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string | null) {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-GH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTimeRange(
  startTime: string | null,
  endTime: string | null,
) {
  const start = formatTime(startTime);
  const end = formatTime(endTime);

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start || end || "Time not specified";
}

export function InstructorAttendanceManager() {
  const [sessions, setSessions] = useState<
    AttendanceSession[]
  >([]);
  const [selectedSessionId, setSelectedSessionId] =
    useState("");
  const [roster, setRoster] =
    useState<AttendanceRoster | null>(null);

  const [attendance, setAttendance] = useState<
    Record<string, StudentAttendance>
  >({});

  const [isLoadingSessions, setIsLoadingSessions] =
    useState(true);
  const [isLoadingRoster, setIsLoadingRoster] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setIsLoadingSessions(true);
      setError("");

      try {
        const response = await fetch(
          "/api/instructor/attendance/sessions",
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load attendance sessions.",
          );
        }

        if (cancelled) {
          return;
        }

        setSessions(payload.data);

        if (payload.data.length > 0) {
          setSelectedSessionId(payload.data[0].id);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load attendance sessions.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSessions(false);
        }
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      return;
    }

    let cancelled = false;

    async function loadRoster() {
      setIsLoadingRoster(true);
      setError("");
      setSaveMessage("");

      try {
        const response = await fetch(
          `/api/instructor/attendance/sessions/${selectedSessionId}`,
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load attendance roster.",
          );
        }

        if (cancelled) {
          return;
        }

        setRoster(payload.data);

        const initialAttendance: Record<
          string,
          StudentAttendance
        > = {};

        for (const student of payload.data.students) {
          initialAttendance[student.studentId] = {
            status: student.status,
            notes: student.notes ?? "",
          };
        }

        setAttendance(initialAttendance);
      } catch (loadError) {
        if (!cancelled) {
          setRoster(null);
          setAttendance({});
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load attendance roster.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRoster(false);
        }
      }
    }

    void loadRoster();

    return () => {
      cancelled = true;
    };
  }, [selectedSessionId]);

  const selectedSession = useMemo(
    () =>
      sessions.find(
        (session) =>
          session.id === selectedSessionId,
      ) ?? null,
    [sessions, selectedSessionId],
  );

  function updateStudentStatus(
    studentId: string,
    status: AttendanceStatus,
  ) {
    setSaveMessage("");

    setAttendance((current) => ({
      ...current,
      [studentId]: {
        status,
        notes: current[studentId]?.notes ?? "",
      },
    }));
  }

  function updateStudentNotes(
    studentId: string,
    notes: string,
  ) {
    setSaveMessage("");

    setAttendance((current) => ({
      ...current,
      [studentId]: {
        status: current[studentId]?.status ?? null,
        notes,
      },
    }));
  }

  async function saveAttendance() {
    if (!roster || isSaving) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const payload = {
        attendance: roster.students.map((student) => ({
          studentId: student.studentId,
          status:
            attendance[student.studentId]?.status ??
            "present",
          notes:
            attendance[
              student.studentId
            ]?.notes.trim() || undefined,
        })),
      };

      const response = await fetch(
        `/api/instructor/attendance/sessions/${roster.session.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to save attendance.",
        );
      }

      setRoster(result.data);

      const updatedAttendance: Record<
        string,
        StudentAttendance
      > = {};

      for (const student of result.data.students) {
        updatedAttendance[student.studentId] = {
          status: student.status,
          notes: student.notes ?? "",
        };
      }

      setAttendance(updatedAttendance);
      setSaveMessage(
        "Attendance saved successfully.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save attendance.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          Instructor Area
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Attendance
        </h1>

        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Record attendance for your Capoeira Ghana
          classes and keep student records up to date.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <label
          htmlFor="attendance-session"
          className="block text-sm font-semibold text-[var(--foreground)]"
        >
          Select class session
        </label>

        <select
          id="attendance-session"
          value={selectedSessionId}
          onChange={(event) =>
            setSelectedSessionId(event.target.value)
          }
          disabled={
            isLoadingSessions ||
            sessions.length === 0 ||
            isLoadingRoster ||
            isSaving
          }
          className="mt-3 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-base text-[var(--foreground)] outline-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:max-w-2xl"
        >
          {isLoadingSessions ? (
            <option value="">
              Loading sessions...
            </option>
          ) : sessions.length === 0 ? (
            <option value="">
              No attendance sessions available
            </option>
          ) : (
            sessions.map((session) => (
              <option
                key={session.id}
                value={session.id}
              >
                {session.className} —{" "}
                {session.sessionDate} —{" "}
                {formatTime(session.startTime)}
              </option>
            ))
          )}
        </select>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800"
        >
          {error}
        </div>
      )}


      {isLoadingRoster && (
        <section
          aria-live="polite"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm"
        >
          <p className="font-medium text-[var(--foreground)]">
            Loading student roster...
          </p>
        </section>
      )}

      {!isLoadingRoster &&
        roster &&
        selectedSession && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                Class Session
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {selectedSession.className}
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                {formatSessionDate(
                  selectedSession.sessionDate,
                )}{" "}
                ·{" "}
                {formatTimeRange(
                  selectedSession.startTime,
                  selectedSession.endTime,
                )}
              </p>
            </section>

            <section
              aria-labelledby="attendance-roster-heading"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
            >
              <div className="border-b border-[var(--border)] p-6 sm:p-8">
                <h2
                  id="attendance-roster-heading"
                  className="text-xl font-bold text-[var(--foreground)]"
                >
                  Student Roster
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Select one attendance status for each
                  actively enrolled student.
                </p>
              </div>

              {roster.students.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-medium text-[var(--foreground)]">
                    No active students are enrolled in
                    this class.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {roster.students.map((student) => {
                    const studentAttendance =
                      attendance[student.studentId];

                    const selectedStatus =
                      studentAttendance?.status ?? null;

                    return (
                      <div
                        key={student.studentId}
                        className="p-6 sm:p-8"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                              {student.firstName}{" "}
                              {student.lastName}
                            </h3>
                          </div>

                          <div
                            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
                            role="group"
                            aria-label={`Attendance status for ${student.firstName} ${student.lastName}`}
                          >
                            {STATUS_OPTIONS.map(
                              (option) => {
                                const isSelected =
                                  selectedStatus ===
                                  option.value;

                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={
                                      isSelected
                                    }
                                    disabled={isSaving}
                                    onClick={() =>
                                      updateStudentStatus(
                                        student.studentId,
                                        option.value,
                                      )
                                    }
                                    className={[
                                      "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
                                      "focus-visible:outline-3 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-3",
                                      isSelected
                                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
                                    ].join(" ")}
                                  >
                                    {option.label}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <div className="mt-5">
                          <label
                            htmlFor={`notes-${student.studentId}`}
                            className="block text-sm font-medium text-[var(--foreground)]"
                          >
                            Notes{" "}
                            <span className="font-normal text-[var(--muted)]">
                              (optional)
                            </span>
                          </label>

                          <textarea
                            id={`notes-${student.studentId}`}
                            value={
                              studentAttendance?.notes ??
                              ""
                            }
                            onChange={(event) =>
                              updateStudentNotes(
                                student.studentId,
                                event.target.value,
                              )
                            }
                            disabled={isSaving}
                            maxLength={500}
                            rows={2}
                            placeholder="Add an optional attendance note..."
                            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {roster.students.length > 0 && (
                <div className="border-t border-[var(--border)] p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--muted)]">
                      {roster.students.length}{" "}
                      {roster.students.length === 1
                        ? "student"
                        : "students"}{" "}
                      in roster
                    </p>

                    <Button
                      type="button"
                      disabled={isSaving}
                      onClick={saveAttendance}
                      className="w-full sm:w-auto"
                    >
                      {isSaving
                        ? "Saving Attendance..."
                        : "Save Attendance"}
                    </Button>
                  </div>

                  {saveMessage && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="mt-4 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800"
                    >
                      {saveMessage}
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}
    </div>
  );
}
