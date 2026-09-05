import { Button } from "@capoeira-ghana/ui";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="flex min-h-screen items-center justify-center px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
            Capoeira Ghana
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Discover. Train. Grow.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            A modern digital home for Capoeira in Ghana - connecting people
            with movement, culture, community, and growth.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button href="#programs">
              Explore Capoeira
            </Button>

            <Button href="#trial" variant="outline">
              Book a Trial
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}