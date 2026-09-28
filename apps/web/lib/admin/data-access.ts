import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdminContext() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error("Unable to verify the current admin session.");
  }

  if (!user) {
    return null;
  }

  const { data: isAdmin, error: roleError } =
    await supabase.rpc("is_admin");

  if (roleError) {
    throw new Error(
      `Unable to verify admin role: ${roleError.message}`,
    );
  }

  if (!isAdmin) {
    return null;
  }

  return {
    userId: user.id,
  };
}

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [
    activeStudentsResult,
    activeEnrollmentsResult,
    pendingTrialsResult,
    attendanceResult,
    upcomingClassesResult,
    recentTrialsResult,
    recentBeltAwardsResult,
  ] = await Promise.all([
    supabase
      .from("student_profiles")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("trial_bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("attendance")
      .select("status"),

    supabase
      .from("class_sessions")
      .select(`
        id,
        session_date,
        start_time,
        end_time,
        classes (
          id,
          name,
          locations (
            name,
            city
          )
        )
      `)
      .gte(
        "session_date",
        new Date().toISOString().slice(0, 10),
      )
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5),

    supabase
      .from("trial_bookings")
      .select(`
        id,
        student_name,
        email,
        preferred_date,
        status,
        booked_at,
        programs (
          name
        ),
        classes (
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("belt_history")
      .select(`
        id,
        student_id,
        awarded_at,
        notes,
        belts (
          name,
          rank_order
        ),
        student_profiles (
          users (
            first_name,
            last_name
          )
        )
      `)
      .order("awarded_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const results = [
    activeStudentsResult,
    activeEnrollmentsResult,
    pendingTrialsResult,
    attendanceResult,
    upcomingClassesResult,
    recentTrialsResult,
    recentBeltAwardsResult,
  ];

  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(
      `Unable to load admin dashboard data: ${failed.error.message}`,
    );
  }

  const attendanceRows = attendanceResult.data ?? [];

  const attendanceRate =
    attendanceRows.length === 0
      ? 0
      : Math.round(
          (attendanceRows.filter(
            (row) =>
              row.status === "present" ||
              row.status === "late",
          ).length /
            attendanceRows.length) *
            100,
        );

  return {
    kpis: {
      activeStudents: activeStudentsResult.count ?? 0,
      activeEnrollments: activeEnrollmentsResult.count ?? 0,
      pendingTrials: pendingTrialsResult.count ?? 0,
      attendanceRate,
    },
    upcomingClasses: upcomingClassesResult.data ?? [],
    recentTrials: recentTrialsResult.data ?? [],
    recentBeltAwards: recentBeltAwardsResult.data ?? [],
  };
}
