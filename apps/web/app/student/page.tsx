import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function StudentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[var(--surface-muted)] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                Student Area
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Welcome to Capoeira Ghana.
              </h1>
            </div>

            <LogoutButton />
          </div>

          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]">
            You are signed in. Your student training, attendance, progression,
            and community experience will appear here as the student platform
            grows.
          </p>

          <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Signed in as
            </p>

            <p className="mt-1 break-all text-sm text-[var(--muted)]">
              {user.email}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
