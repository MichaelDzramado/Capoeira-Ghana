import { Button } from "@capoeira-ghana/ui";
import { listClasses, type ScheduleClass } from "@/lib/classes/service";
import { ClassCard } from "./class-card";

function groupClassesByDay(classes: ScheduleClass[]) {
  return classes.reduce<Record<string, ScheduleClass[]>>((groups, item) => {
    if (!groups[item.dayName]) {
      groups[item.dayName] = [];
    }

    groups[item.dayName].push(item);

    return groups;
  }, {});
}

export async function ClassesSection() {
  let classes: ScheduleClass[] = [];
  let hasError = false;

  try {
    classes = await listClasses();
  } catch (error) {
    console.error("Classes section failed to load:", error);
    hasError = true;
  }

  const groupedClasses = groupClassesByDay(classes);

  return (
    <section
      id="classes"
      aria-labelledby="classes-heading"
      className="border-t border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            Classes & Schedule
          </p>

          <h2
            id="classes-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl"
          >
            Find a class that fits your journey
          </h2>

          <p className="mt-4 text-base leading-7 text-[var(--muted)] sm:text-lg">
            Train with us throughout the week in welcoming spaces designed for
            learning, movement, and community.
          </p>
        </div>

        {hasError ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Schedule temporarily unavailable
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              We are unable to load the current class schedule. Please try
              again shortly or contact us for more information.
            </p>

            <div className="mt-6">
              <Button href="/book-a-trial" variant="primary">
                Book a Trial
              </Button>
            </div>
          </div>
        ) : classes.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Classes coming soon
            </h3>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              We are preparing our class schedule. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {Object.entries(groupedClasses).map(([day, dayClasses]) => (
              <div key={day}>
                <div className="mb-5 flex items-center gap-4">
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    {day}
                  </h3>
                  <div className="h-px flex-1 bg-[var(--border)]" />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {dayClasses.map((classItem) => (
                    <ClassCard key={classItem.id} classItem={classItem} />
                  ))}
                </div>
              </div>
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