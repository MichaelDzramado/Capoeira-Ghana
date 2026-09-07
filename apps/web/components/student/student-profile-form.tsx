"use client";

import { FormEvent, useState } from "react";

type StudentProfile = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  studentProfile: {
    id: string;
    date_of_birth: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    joined_at: string | null;
  } | null;
};

type Props = {
  initialProfile: StudentProfile;
};

export function StudentProfileForm({ initialProfile }: Props) {
  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [dateOfBirth, setDateOfBirth] = useState(
    initialProfile.studentProfile?.date_of_birth ?? "",
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    initialProfile.studentProfile?.emergency_contact_name ?? "",
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    initialProfile.studentProfile?.emergency_contact_phone ?? "",
  );

  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setFormError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          dateOfBirth,
          emergencyContactName,
          emergencyContactPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const firstFieldError = result.fieldErrors
          ? Object.values(result.fieldErrors).flat()[0]
          : undefined;

        setFormError(
          firstFieldError ??
            result.error ??
            "Unable to update your profile.",
        );
        return;
      }

      const updatedProfile = result.profile as StudentProfile;

      setFirstName(updatedProfile.firstName);
      setLastName(updatedProfile.lastName);
      setPhone(updatedProfile.phone);
      setDateOfBirth(
        updatedProfile.studentProfile?.date_of_birth ?? "",
      );
      setEmergencyContactName(
        updatedProfile.studentProfile?.emergency_contact_name ?? "",
      );
      setEmergencyContactPhone(
        updatedProfile.studentProfile?.emergency_contact_phone ?? "",
      );

      setMessage("Your profile has been updated successfully.");
    } catch {
      setFormError("Unable to update your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      <section>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Personal Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="student-first-name"
              className="block text-sm font-semibold text-[var(--foreground)]"
            >
              First name
            </label>
            <input
              id="student-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              disabled={isSaving}
              required
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="student-last-name"
              className="block text-sm font-semibold text-[var(--foreground)]"
            >
              Last name
            </label>
            <input
              id="student-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              disabled={isSaving}
              required
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="student-email"
              className="block text-sm font-semibold text-[var(--foreground)]"
            >
              Email address
            </label>
            <input
              id="student-email"
              type="email"
              value={initialProfile.email ?? ""}
              readOnly
              aria-describedby="student-email-note"
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[var(--muted)] outline-none"
            />
            <p
              id="student-email-note"
              className="mt-2 text-xs text-[var(--muted)]"
            >
              Your account email cannot be changed from your student profile.
            </p>
          </div>

          <div>
            <label
              htmlFor="student-phone"
              className="block text-sm font-semibold text-[var(--foreground)]"
            >
              Phone number
            </label>
            <input
              id="student-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={isSaving}
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="student-date-of-birth"
              className="block text-sm font-semibold text-[var(--foreground)]"
            >
              Date of birth
            </label>
            <input
              id="student-date-of-birth"
              name="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              disabled={isSaving}
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] pt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Emergency Contact
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="emergency-contact-name"
              className="block text-sm font-semibold text-[var(--foreground)]"
            >
              Contact name
            </label>
            <input
              id="emergency-contact-name"
              name="emergencyContactName"
              type="text"
              autoComplete="name"
              value={emergencyContactName}
              onChange={(event) =>
                setEmergencyContactName(event.target.value)
              }
              disabled={isSaving}
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="emergency-contact-phone"
              className="block text-sm font-semibold text-[var(--foreground)]"
            >
              Contact phone
            </label>
            <input
              id="emergency-contact-phone"
              name="emergencyContactPhone"
              type="tel"
              autoComplete="tel"
              value={emergencyContactPhone}
              onChange={(event) =>
                setEmergencyContactPhone(event.target.value)
              }
              disabled={isSaving}
              className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {formError}
        </p>
      ) : null}

      {message ? (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-dark)] focus-visible:outline-3 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSaving ? "Saving changes..." : "Save changes"}
      </button>
    </form>
  );
}
