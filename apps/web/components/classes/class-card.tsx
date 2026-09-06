import { Button } from "@capoeira-ghana/ui";
import type { ScheduleClass } from "@/lib/classes/service";

type ClassCardProps = {
  classItem: ScheduleClass;
};

export function ClassCard({ classItem }: ClassCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          {classItem.program?.name ?? "Capoeira"}
        </span>

        {classItem.capacity ? (
          <span className="text-xs font-medium text-[var(--muted)]">
            Up to {classItem.capacity}
          </span>
        ) : null}
      </div>

      <h3 className="mt-5 text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {classItem.name}
      </h3>

      <div className="mt-5 space-y-3 text-sm">
        <div>
          <p className="font-semibold text-[var(--foreground)]">
            {classItem.startTime} - {classItem.endTime}
          </p>
          <p className="mt-1 text-[var(--muted)]">
            Every {classItem.dayName}
          </p>
        </div>

        {classItem.location ? (
          <div className="border-t border-[var(--border)] pt-3">
            <p className="font-semibold text-[var(--foreground)]">
              {classItem.location.name}
            </p>

            {classItem.location.address ? (
              <p className="mt-1 text-[var(--muted)]">
                {classItem.location.address}
              </p>
            ) : null}

            {classItem.location.city || classItem.location.region ? (
              <p className="mt-1 text-[var(--muted)]">
                {[classItem.location.city, classItem.location.region]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-auto pt-6">
        <Button href="/book-a-trial" variant="primary" className="w-full">
          Book a Trial
        </Button>
      </div>
    </article>
  );
}