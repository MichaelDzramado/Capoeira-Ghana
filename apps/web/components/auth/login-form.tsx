"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { loginSchema } from "@/lib/auth/schema";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const firstError =
        result.error.issues[0]?.message ??
        "Please enter your email and password.";
      setFormError(firstError);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: result.data.email,
          password: result.data.password,
        });

      if (error || !data.user) {
        setFormError("Invalid email or password.");
        return;
      }

      const { data: roleRows, error: roleError } =
        await supabase
          .from("user_roles")
          .select("roles ( name )")
          .eq("user_id", data.user.id);

      if (roleError) {
        setFormError(
          "Unable to determine your account role. Please try again.",
        );
        await supabase.auth.signOut();
        return;
      }

      const roles = (roleRows ?? []).flatMap((row) => {
        const relatedRoles = row.roles as unknown as
          | { name: string }[]
          | { name: string }
          | null;

        if (Array.isArray(relatedRoles)) {
          return relatedRoles.map((role) => role.name);
        }

        return relatedRoles?.name ? [relatedRoles.name] : [];
      });

      if (roles.includes("instructor")) {
        router.push("/instructor/attendance");
      } else {
        router.push("/student");
      }

      router.refresh();
    } catch {
      setFormError("Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-[var(--foreground)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-[var(--foreground)]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
        />
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
