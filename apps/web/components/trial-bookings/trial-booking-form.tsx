"use client";

import { useEffect, useMemo, useState } from "react";

type Program = {
  id: string;
  name: string;
  slug: string;
  description: string;
  age_group: string;
  level: string;
  duration_minutes: number;
};

type ScheduleClass = {
  id: string;
  name: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  capacity: number | null;
  program: {
    id: string;
    name: string;
    slug: string;
  } | null;
  location: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    region: string | null;
  } | null;
};

type FormState = {
  studentName: string;
  email: string;
  phone: string;
  age: string;
  programId: string;
  classId: string;
  preferredDate: string;
  message: string;
};

const initialForm: FormState = {
  studentName: "",
  email: "",
  phone: "",
  age: "",
  programId: "",
  classId: "",
  preferredDate: "",
  message: "",
};

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function TrialBookingForm() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [classes, setClasses] = useState<ScheduleClass[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [programResponse, classResponse] = await Promise.all([
          fetch("/api/programs"),
          fetch("/api/classes"),
        ]);

        if (!programResponse.ok || !classResponse.ok) {
          throw new Error("Unable to load booking options.");
        }

        const programJson = await programResponse.json();
        const classJson = await classResponse.json();

        setPrograms(programJson.data ?? []);
        setClasses(classJson.data ?? []);
      } catch {
        setError(
          "We couldn't load the available programs and classes. Please refresh and try again.",
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === form.programId),
    [programs, form.programId],
  );

  const filteredClasses = useMemo(() => {
    if (!form.programId) {
      return classes;
    }

    return classes.filter(
      (classItem) => classItem.program?.id === form.programId,
    );
  }, [classes, form.programId]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function handleProgramChange(value: string) {
    setForm((current) => ({
      ...current,
      programId: value,
      classId: "",
    }));

    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.studentName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    const age = form.age ? Number(form.age) : undefined;

    if (age !== undefined && (!Number.isInteger(age) || age < 0 || age > 120)) {
      setError("Please enter a valid age.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/trial-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: form.studentName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          age,
          programId: form.programId || undefined,
          classId: form.classId || undefined,
          preferredDate: form.preferredDate || undefined,
          message: form.message.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to submit your trial request.",
        );
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit your trial request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-muted)] text-3xl text-[var(--primary)]">
          ?
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          Trial request received
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Your Capoeira journey starts here.
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-[var(--muted)]">
          Thanks for choosing Capoeira Ghana. We&apos;ve received your trial
          request and will get in touch to confirm your session.
        </p>

        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-8 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-dark)]"
        >
          Book Another Trial
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            Your details
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
            Tell us about you
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Give us a few details so we can prepare the right trial
            experience for you.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Full name <span className="text-[var(--primary)]">*</span>
            </span>
            <input
              required
              value={form.studentName}
              onChange={(event) =>
                updateField("studentName", event.target.value)
              }
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="Your full name"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Email <span className="text-[var(--primary)]">*</span>
            </span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="you@example.com"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Phone
            </span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="024 XXX XXXX"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Age
            </span>
            <input
              type="number"
              min="0"
              max="120"
              value={form.age}
              onChange={(event) => updateField("age", event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="Your age"
            />
          </label>
        </div>

        <div className="border-t border-[var(--border)] pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            Your trial
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
            Choose your starting point
          </h2>
        </div>

        {loadingOptions ? (
          <div className="rounded-lg bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
            Loading programs and classes...
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                Program
              </span>
              <select
                value={form.programId}
                onChange={(event) => handleProgramChange(event.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              >
                <option value="">Select a program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>

              {selectedProgram && (
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  {selectedProgram.level} Â· {selectedProgram.duration_minutes}{" "}
                  minutes
                </p>
              )}
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                Preferred class
              </span>
              <select
                value={form.classId}
                onChange={(event) =>
                  updateField("classId", event.target.value)
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              >
                <option value="">Select a class</option>
                {filteredClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.dayName} Â· {classItem.name} Â·{" "}
                    {classItem.startTime}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                Preferred date
              </span>
              <input
                type="date"
                min={todayString()}
                value={form.preferredDate}
                onChange={(event) =>
                  updateField("preferredDate", event.target.value)
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </label>
          </div>
        )}

        <div>
  <label
    htmlFor="message"
    className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
  >
    Anything you&apos;d like us to know?
  </label>
  <textarea
    id="message"
    name="message"
    rows={5}
    maxLength={1000}
    value={form.message}
    onChange={(event) => updateField("message", event.target.value)}
    className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
    placeholder="Tell us about your experience, goals, or anything else that may help us prepare."
  />
</div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-5 text-[var(--muted)]">
            Submitting this form sends a trial request to Capoeira Ghana. We
            will contact you to confirm the session.
          </p>

          <button
            type="submit"
            disabled={submitting || loadingOptions}
            className="rounded-lg bg-[var(--primary)] px-7 py-3.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Book My Trial"}
          </button>
        </div>
      </div>
    </form>
  );
}
