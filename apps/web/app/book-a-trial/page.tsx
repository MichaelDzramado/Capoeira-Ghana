import { TrialBookingForm } from "@/components/trial-bookings/trial-booking-form";

export default function BookATrialPage() {
  return (
    <main>
      <section className="bg-black px-6 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Start Your Capoeira Journey
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Book your first Capoeira experience.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              Tell us a little about yourself and choose a preferred program
              or class. We will use your request to help arrange your first
              Capoeira experience.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <TrialBookingForm />
          </div>

          <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-6">
            <h2 className="text-xl font-bold">What to expect</h2>

            <ul className="mt-5 space-y-4 text-sm leading-6 text-[var(--muted)]">
              <li>
                <strong className="text-[var(--foreground)]">
                  1. Choose your preferences
                </strong>
                <br />
                Tell us which program or class interests you.
              </li>

              <li>
                <strong className="text-[var(--foreground)]">
                  2. Submit your request
                </strong>
                <br />
                Your booking request is sent to the Capoeira Ghana team.
              </li>

              <li>
                <strong className="text-[var(--foreground)]">
                  3. We follow up
                </strong>
                <br />
                We can confirm the appropriate class and next steps.
              </li>
            </ul>

            <div className="mt-8 border-t border-[var(--border)] pt-6">
              <h3 className="font-semibold">New to Capoeira?</h3>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                No experience is required. Our beginner-friendly programs are
                designed to help you learn progressively.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
