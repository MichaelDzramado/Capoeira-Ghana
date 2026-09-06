import { Button } from "@capoeira-ghana/ui";
import { listPrograms } from "@/lib/programs/service";
import type { Program } from "@/lib/programs/schemas";
import { ProgramCard } from "./program-card";

export async function ProgramsSection() {
  let programs: Program[] = [];
  let hasError = false;

  try {
    programs = await listPrograms();
  } catch (error) {
    console.error("Programs section failed to load:", error);
    hasError = true;
  }

  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="border-t border-[var(--border)] bg-[var(--surface-muted)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            Train with us
          </p>

          <h2
            id="programs-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
          >
            Find the right Capoeira program for you
          </h2>

          <p className="mt-4 text-base leading-7 text-[var(--muted)] sm:text-lg">
            Whether you are discovering Capoeira for the first time or
            developing your skills, our structured programs help you move,
            learn, and grow.
          </p>
        </div>

        {hasError ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Programs are temporarily unavailable
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              We are unable to load our programs right now. Please try again
              shortly or contact us for more information.
            </p>

            <div className="mt-6">
              <Button href="/book-a-trial" variant="primary">
                Book a Trial
              </Button>
            </div>
          </div>
        ) : programs.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Programs coming soon
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              We are preparing our training programs. Please check back soon
              or contact us for more information.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button href="/book-a-trial" variant="primary">
            Start Your Capoeira Journey
          </Button>
        </div>
      </div>
    </section>
  );
}
