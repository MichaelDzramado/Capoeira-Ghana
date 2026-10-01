import { getPublicContent } from "@/lib/content/service";

export async function ContentSections() {
  const { pages, blogPosts, testimonials, faqs, galleryItems } =
    await getPublicContent();

  const whatIsCapoeira = pages.find(
    (page) => page.slug === "what-is-capoeira",
  );

  const about = pages.find((page) => page.slug === "about");

  return (
    <>
      <section id="about-capoeira" className="bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              What is Capoeira?
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Movement, music, culture, and community
            </h2>

            <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
              {whatIsCapoeira?.content ??
                "Capoeira is a Brazilian art combining movement, music, rhythm, culture, and community."}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-muted)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                About Capoeira Ghana
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                A place to discover, train, grow, and connect
              </h2>
            </div>

            <p className="text-lg leading-8 text-[var(--muted)]">
              {about?.content ??
                "Capoeira Ghana connects movement, culture, community, and personal growth."}
            </p>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                Community
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                What our community says
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <p className="text-base leading-7 text-[var(--foreground)]">
                    “{testimonial.quote}”
                  </p>

                  <div className="mt-6">
                    <p className="font-semibold text-[var(--foreground)]">
                      {testimonial.name}
                    </p>
                    {testimonial.role && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {blogPosts.length > 0 && (
        <section className="bg-[var(--surface-muted)]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                  From the community
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  Latest stories
                </h2>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    Capoeira Ghana
                  </p>

                  <h3 className="mt-3 text-xl font-bold text-[var(--foreground)]">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {post.excerpt}
                    </p>
                  )}

                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="bg-[var(--surface)]">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                FAQ
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <summary className="cursor-pointer list-none font-semibold text-[var(--foreground)]">
                    <span className="flex items-center justify-between gap-6">
                      {faq.question}
                      <span
                        aria-hidden="true"
                        className="text-xl text-[var(--primary)] transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>

                  <p className="mt-4 leading-7 text-[var(--muted)]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[var(--surface-muted)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              Gallery
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Capoeira in motion
            </h2>
          </div>

          {galleryItems.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
              <p className="font-semibold text-[var(--foreground)]">
                Gallery coming soon
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Photos and moments from the Capoeira Ghana community will
                appear here.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <div className="aspect-[4/3] bg-[var(--surface-muted)]">
                    {item.storage_path ? (
                      <img
                        src={item.storage_path}
                        alt={item.alt_text ?? item.title ?? "Capoeira Ghana gallery image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                        Image coming soon
                      </div>
                    )}
                  </div>

                  {item.title && (
                    <div className="p-5">
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}



