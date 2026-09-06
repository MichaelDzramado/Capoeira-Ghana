import type { Program } from "@/lib/programs/schemas";
import { Button } from "@capoeira-ghana/ui";

type ProgramCardProps = {
  program: Program;
};

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5">
        <span className="inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          {program.level ?? "All Levels"}
        </span>
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {program.name}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">
        {program.description ??
          "Structured Capoeira training designed to help you move, learn, and grow."}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Age Group
          </dt>
          <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {program.age_group ?? "All ages"}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Duration
          </dt>
          <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {program.duration_minutes
              ? `${program.duration_minutes} min`
              : "Flexible"}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <Button href="/book-a-trial" variant="primary" className="w-full">
          Book a Trial
        </Button>
      </div>
    </article>
  );
}
