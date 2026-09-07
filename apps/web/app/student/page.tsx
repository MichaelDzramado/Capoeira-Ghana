import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { StudentProfileForm } from "@/components/student/student-profile-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStudentProfile } from "@/lib/student-profile-data-access";

export default async function StudentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentStudentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[var(--surface-muted)] px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                Student Area
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Welcome, {profile.firstName}.
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                Manage your student information and keep your Capoeira Ghana
                profile up to date.
              </p>
            </div>

            <LogoutButton />
          </div>

          <StudentProfileForm initialProfile={profile} />
        </section>
      </div>
    </main>
  );
}
