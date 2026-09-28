"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@capoeira-ghana/ui";

type ProgressionStudent = {
  studentId: string;
  firstName: string;
  lastName: string;
};

type ProgressionBelt = {
  id: string;
  name: string;
  rankOrder: number;
  description: string | null;
};

type ProgressionHistoryItem = {
  id: string;
  beltId: string;
  beltName: string;
  rankOrder: number;
  awardedAt: string;
  awardedBy: string | null;
  notes: string | null;
};

type StudentProgress = {
  id: string | null;
  studentId: string;
  currentBeltId: string | null;
  currentBeltName: string | null;
  currentBeltRank: number | null;
  currentBeltDescription: string | null;
  notes: string | null;
  updatedAt: string | null;
};

type ProgressionStudentDetail = {
  student: ProgressionStudent;
  progress: StudentProgress;
  belts: ProgressionBelt[];
  history: ProgressionHistoryItem[];
};

function formatAwardedDate(date: string) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
  }).format(new Date(`${date}T00:00:00`));
}

export function InstructorProgressionManager() {
  const [students, setStudents] = useState<
    ProgressionStudent[]
  >([]);

  const [selectedStudentId, setSelectedStudentId] =
    useState("");

  const [detail, setDetail] =
    useState<ProgressionStudentDetail | null>(null);

  const [selectedBeltId, setSelectedBeltId] =
    useState("");

  const [notes, setNotes] = useState("");

  const [isLoadingStudents, setIsLoadingStudents] =
    useState(true);

  const [isLoadingDetail, setIsLoadingDetail] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      setIsLoadingStudents(true);
      setError("");

      try {
        const response = await fetch(
          "/api/instructor/progression/students",
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load progression students.",
          );
        }

        if (cancelled) {
          return;
        }

        setStudents(payload.data);

        if (payload.data.length > 0) {
          setSelectedStudentId(
            payload.data[0].studentId,
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load progression students.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingStudents(false);
        }
      }
    }

    void loadStudents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      return;
    }

    let cancelled = false;

    async function loadProgression() {
      setIsLoadingDetail(true);
      setError("");
      setSaveMessage("");

      try {
        const response = await fetch(
          `/api/instructor/progression/students/${selectedStudentId}`,
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load student progression.",
          );
        }

        if (cancelled) {
          return;
        }

        setDetail(payload.data);
        setSelectedBeltId(
          payload.data.progress.currentBeltId ?? "",
        );
        setNotes(payload.data.progress.notes ?? "");
      } catch (loadError) {
        if (!cancelled) {
          setDetail(null);
          setSelectedBeltId("");
          setNotes("");
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load student progression.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      }
    }

    void loadProgression();

    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  const selectedStudent = useMemo(
    () =>
      students.find(
        (student) =>
          student.studentId === selectedStudentId,
      ) ?? null,
    [students, selectedStudentId],
  );

  const selectedBelt = useMemo(
    () =>
      detail?.belts.find(
        (belt) => belt.id === selectedBeltId,
      ) ?? null,
    [detail, selectedBeltId],
  );

  async function awardBelt() {
    if (
      !detail ||
      !selectedBeltId ||
      isSaving
    ) {
      return;
    }

    if (
      selectedBeltId === detail.progress.currentBeltId
    ) {
      setError(
        "Select a different belt from the student&apos;s current belt.",
      );
      return;
    }

    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(
        `/api/instructor/progression/students/${detail.student.studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            beltId: selectedBeltId,
            notes: notes.trim() || "",
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to update student progression.",
        );
      }

      setDetail(payload.data);
      setSelectedBeltId(
        payload.data.progress.currentBeltId ?? "",
      );
      setNotes(payload.data.progress.notes ?? "");
      setSaveMessage(
        "Student progression updated successfully.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update student progression.",
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
          Student Progression
        </h1>

        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Review student belt progression and record
          the next stage of development for actively
          taught students.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <label
          htmlFor="progression-student"
          className="block text-sm font-semibold text-[var(--foreground)]"
        >
          Select student
        </label>

        <select
          id="progression-student"
          value={selectedStudentId}
          onChange={(event) =>
            setSelectedStudentId(event.target.value)
          }
          disabled={
            isLoadingStudents ||
            students.length === 0 ||
            isLoadingDetail ||
            isSaving
          }
          className="mt-3 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-base text-[var(--foreground)] outline-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:max-w-2xl"
        >
          {isLoadingStudents ? (
            <option value="">
              Loading students...
            </option>
          ) : students.length === 0 ? (
            <option value="">
              No active students available
            </option>
          ) : (
            students.map((student) => (
              <option
                key={student.studentId}
                value={student.studentId}
              >
                {student.firstName} {student.lastName}
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

      {isLoadingDetail && (
        <section
          aria-live="polite"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm"
        >
          <p className="font-medium text-[var(--foreground)]">
            Loading student progression...
          </p>
        </section>
      )}

      {!isLoadingDetail &&
        detail &&
        selectedStudent && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                Student
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                {selectedStudent.firstName}{" "}
                {selectedStudent.lastName}
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                  <p className="text-sm font-medium text-[var(--muted)]">
                    Current Belt
                  </p>

                  <p className="mt-2 text-xl font-bold text-[var(--foreground)]">
                    {detail.progress.currentBeltName ??
                      "Not assigned"}
                  </p>

                  {detail.progress.currentBeltRank && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Rank {detail.progress.currentBeltRank}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                  <p className="text-sm font-medium text-[var(--muted)]">
                    Belt Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    {detail.progress
                      .currentBeltDescription ??
                      "No description available."}
                  </p>
                </div>
              </div>

              {detail.progress.notes && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-[var(--muted)]">
                    Current Progression Note
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    {detail.progress.notes}
                  </p>
                </div>
              )}
            </section>

            <section
              aria-labelledby="progression-history-heading"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
            >
              <div className="border-b border-[var(--border)] p-6 sm:p-8">
                <h2
                  id="progression-history-heading"
                  className="text-xl font-bold text-[var(--foreground)]"
                >
                  Belt History
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Review the student&apos;s recorded belt
                  progression.
                </p>
              </div>

              {detail.history.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-medium text-[var(--foreground)]">
                    No belt history recorded.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {detail.history.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 sm:p-8"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">
                            {item.beltName}
                          </h3>

                          <p className="mt-1 text-sm text-[var(--muted)]">
                            Rank {item.rankOrder} ·{" "}
                            {formatAwardedDate(
                              item.awardedAt,
                            )}
                          </p>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section
              aria-labelledby="award-belt-heading"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                  Progression Update
                </p>

                <h2
                  id="award-belt-heading"
                  className="mt-2 text-xl font-bold text-[var(--foreground)]"
                >
                  Award New Belt
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Select the student&apos;s new belt and
                  optionally record a progression note.
                </p>
              </div>

              <div className="mt-6 grid gap-6">
                <div>
                  <label
                    htmlFor="progression-belt"
                    className="block text-sm font-semibold text-[var(--foreground)]"
                  >
                    New belt
                  </label>

                  <select
                    id="progression-belt"
                    value={selectedBeltId}
                    onChange={(event) => {
                      setSelectedBeltId(
                        event.target.value,
                      );
                      setSaveMessage("");
                      setError("");
                    }}
                    disabled={isSaving}
                    className="mt-3 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-base text-[var(--foreground)] outline-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <option value="">
                      Select a belt
                    </option>

                    {detail.belts.map((belt) => (
                      <option
                        key={belt.id}
                        value={belt.id}
                      >
                        Rank {belt.rankOrder} —{" "}
                        {belt.name}
                      </option>
                    ))}
                  </select>

                  {selectedBelt?.description && (
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {selectedBelt.description}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="progression-notes"
                    className="block text-sm font-semibold text-[var(--foreground)]"
                  >
                    Progression note{" "}
                    <span className="font-normal text-[var(--muted)]">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="progression-notes"
                    value={notes}
                    onChange={(event) => {
                      setNotes(event.target.value);
                      setSaveMessage("");
                      setError("");
                    }}
                    disabled={isSaving}
                    maxLength={1000}
                    rows={4}
                    placeholder="Add a note about the student's progression..."
                    className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  />

                  <p className="mt-2 text-right text-xs text-[var(--muted)]">
                    {notes.length}/1000
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--muted)]">
                    Current belt:{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {detail.progress.currentBeltName ??
                        "Not assigned"}
                    </span>
                  </p>

                  <Button
                    type="button"
                    disabled={
                      isSaving ||
                      !selectedBeltId ||
                      selectedBeltId ===
                        detail.progress.currentBeltId
                    }
                    onClick={awardBelt}
                    className="w-full sm:w-auto"
                  >
                    {isSaving
                      ? "Updating Progression..."
                      : "Award Belt"}
                  </Button>
                </div>

                {saveMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800"
                  >
                    {saveMessage}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
    </div>
  );
}
