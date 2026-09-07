import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Student Login",
  description: "Sign in to your Capoeira Ghana student account.",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[var(--surface-muted)] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            Student Area
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Continue your Capoeira journey.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Sign in to access your student space, training information,
            attendance, progression, and community experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-[var(--muted)]">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
              Train
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
              Track progress
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
              Grow
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-9">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Sign in
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use the email address and password associated with your student
              account.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            New to Capoeira Ghana?{" "}
            <a
              href="/book-a-trial"
              className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline"
            >
              Book a trial
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
