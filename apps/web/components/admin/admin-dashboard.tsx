"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  kpis: {
    activeStudents: number;
    activeEnrollments: number;
    pendingTrials: number;
    attendanceRate: number;
  };
  upcomingClasses: Array<{
    id: string;
    session_date: string;
    start_time: string | null;
    end_time: string | null;
    classes:
      | {
          id: string;
          name: string;
          locations:
            | {
                name: string;
                city: string;
              }
            | null;
        }
      | null;
  }>;
  recentTrials: Array<{
    id: string;
    student_name: string;
    email: string;
    preferred_date: string | null;
    status: string;
    booked_at: string;
    programs: { name: string } | null;
    classes: { name: string } | null;
  }>;
  recentBeltAwards: Array<{
    id: string;
    student_id: string;
    awarded_at: string;
    notes: string | null;
    belts: {
      name: string;
      rank_order: number;
    } | null;
    student_profiles:
      | {
          users:
            | {
                first_name: string;
                last_name: string;
              }
            | null;
        }
      | null;
  }>;
};

function formatDate(date: string | null) {
  if (!date) {
    return "Date not specified";
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
  }).format(new Date(`${date}T00:00:00`));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatTime(time: string | null) {
  if (!time) {
    return "Time not specified";
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

const KPI_ITEMS = [
  {
    key: "activeStudents",
    label: "Active Students",
  },
  {
    key: "activeEnrollments",
    label: "Active Enrollments",
  },
  {
    key: "pendingTrials",
    label: "Pending Trials",
  },
  {
    key: "attendanceRate",
    label: "Attendance Rate",
  },
] as const;

export function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/admin/dashboard",
        );

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load admin dashboard.",
          );
        }

        if (!cancelled) {
          setDashboard(payload.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load admin dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          Admin Area
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Monitor student activity, classes, trial
          bookings, attendance, and progression from one
          operational view.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800"
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <section
          aria-live="polite"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm"
        >
          <p className="font-medium text-[var(--foreground)]">
            Loading dashboard...
          </p>
        </section>
      ) : dashboard ? (
        <>
          <section
            aria-labelledby="admin-kpis-heading"
            className="space-y-4"
          >
            <div>
              <h2
                id="admin-kpis-heading"
                className="text-xl font-bold text-[var(--foreground)]"
              >
                Overview
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Current operational indicators.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {KPI_ITEMS.map((item) => {
                const value =
                  dashboard.kpis[item.key];

                return (
                  <article
                    key={item.key}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
                  >
                    <p className="text-sm font-medium text-[var(--muted)]">
                      {item.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)]">
                      {item.key === "attendanceRate"
                        ? `${value}%`
                        : value}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="upcoming-classes-heading"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
          >
            <div className="border-b border-[var(--border)] p-6 sm:p-8">
              <h2
                id="upcoming-classes-heading"
                className="text-xl font-bold text-[var(--foreground)]"
              >
                Upcoming Classes
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                The next scheduled class sessions.
              </p>
            </div>

            {dashboard.upcomingClasses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-medium text-[var(--foreground)]">
                  No upcoming classes found.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {dashboard.upcomingClasses.map(
                  (session) => (
                    <div
                      key={session.id}
                      className="p-6 sm:p-8"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-[var(--foreground)]">
                            {session.classes?.name ??
                              "Class"}
                          </h3>

                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {formatDate(
                              session.session_date,
                            )}{" "}
                            ·{" "}
                            {formatTime(
                              session.start_time,
                            )}{" "}
                            –{" "}
                            {formatTime(
                              session.end_time,
                            )}
                          </p>
                        </div>

                        <p className="text-sm text-[var(--muted)]">
                          {session.classes?.locations
                            ? `${session.classes.locations.name}, ${session.classes.locations.city}`
                            : "Location not specified"}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section
              aria-labelledby="recent-trials-heading"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
            >
              <div className="border-b border-[var(--border)] p-6">
                <h2
                  id="recent-trials-heading"
                  className="text-xl font-bold text-[var(--foreground)]"
                >
                  Recent Trial Bookings
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Latest enquiries submitted through the
                  trial booking flow.
                </p>
              </div>

              {dashboard.recentTrials.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="font-medium text-[var(--foreground)]">
                    No trial bookings found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {dashboard.recentTrials.map(
                    (trial) => (
                      <div
                        key={trial.id}
                        className="p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-[var(--foreground)]">
                              {trial.student_name}
                            </h3>

                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {trial.email}
                            </p>

                            <p className="mt-2 text-sm text-[var(--muted)]">
                              {trial.programs?.name ??
                                "Program not specified"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold capitalize text-[var(--foreground)]">
                            {trial.status}
                          </span>
                        </div>

                        <p className="mt-4 text-xs text-[var(--muted)]">
                          Preferred date:{" "}
                          {formatDate(
                            trial.preferred_date,
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Booked:{" "}
                          {formatDateTime(
                            trial.booked_at,
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>

            <section
              aria-labelledby="recent-belt-awards-heading"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
            >
              <div className="border-b border-[var(--border)] p-6">
                <h2
                  id="recent-belt-awards-heading"
                  className="text-xl font-bold text-[var(--foreground)]"
                >
                  Recent Belt Awards
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  Latest recorded student progression.
                </p>
              </div>

              {dashboard.recentBeltAwards.length ===
              0 ? (
                <div className="p-6 text-center">
                  <p className="font-medium text-[var(--foreground)]">
                    No belt awards found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {dashboard.recentBeltAwards.map(
                    (award) => {
                      const student =
                        award.student_profiles?.users;

                      return (
                        <div
                          key={award.id}
                          className="p-6"
                        >
                          <h3 className="font-semibold text-[var(--foreground)]">
                            {student
                              ? `${student.first_name} ${student.last_name}`
                              : "Student"}
                          </h3>

                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {award.belts?.name ??
                              "Belt not specified"}{" "}
                            ·{" "}
                            {formatDate(
                              award.awarded_at,
                            )}
                          </p>

                          {award.notes && (
                            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                              {award.notes}
                            </p>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
