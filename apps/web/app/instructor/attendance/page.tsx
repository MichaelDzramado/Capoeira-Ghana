import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { InstructorAttendanceManager } from "@/components/instructor/attendance/instructor-attendance-manager";
import { createClient } from "@/lib/supabase/server";

export default async function InstructorAttendancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[var(--surface-muted)] px-6 py-12 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex justify-end">
          <LogoutButton />
        </div>

        <InstructorAttendanceManager />
      </div>
    </main>
  );
}
