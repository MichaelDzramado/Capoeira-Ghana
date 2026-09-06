import { Button } from "@capoeira-ghana/ui";
import { ClassesSection } from "@/components/classes/classes-section";
import { ProgramsSection } from "@/components/programs/programs-section";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-[var(--foreground)] text-[var(--primary-foreground)]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
              Capoeira Ghana
            </p>

            <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Discover.
              <br />
              Train.
              <br />
              Grow.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
              Discover the movement, music, culture, and community of
              Capoeira. Start your journey with Capoeira Ghana.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href="#programs" variant="primary">
                Explore Programs
              </Button>

              <Button href="/book-a-trial" variant="secondary">
                Book a Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Movement
            </p>
            <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
              Move with purpose
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Build coordination, mobility, balance, strength, and confidence
              through Capoeira movement.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Culture
            </p>
            <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
              Learn the culture
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Experience the music, rhythm, history, traditions, and cultural
              expression that make Capoeira unique.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Community
            </p>
            <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">
              Grow together
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Train in a welcoming community where discipline, connection,
              confidence, and continuous growth matter.
            </p>
          </div>
        </div>
      </section>

      <ProgramsSection />

      <ClassesSection />
    </main>
  );
}
