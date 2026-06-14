import { Container } from "@/components/ui/container";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";

export type LegalSection = {
  heading: string;
  paragraphs?: ReadonlyArray<string>;
  bullets?: ReadonlyArray<string>;
};

/**
 * Shared layout for the legal/policy pages (Terms, Privacy, Code of Conduct).
 * Brand-consistent navy header + readable single-column body.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  note,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  note?: string;
  sections: ReadonlyArray<LegalSection>;
}): React.ReactElement {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-primary py-16 text-white lg:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />
        <Container size="default">
          <SectionEyebrow tone="gold">{eyebrow}</SectionEyebrow>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl text-balance">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-white/75 text-pretty">{intro}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Last updated: {updated}
          </p>
        </Container>
      </section>

      <section className="relative bg-surface py-20 lg:py-28">
        <Container size="default">
          {note && (
            <div className="mb-10 rounded-2xl border border-gold/30 bg-gold-50/60 px-5 py-4 text-sm text-ink-muted">
              {note}
            </div>
          )}

          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="font-display text-2xl font-medium text-primary">
                  {s.heading}
                </h2>
                {s.paragraphs?.map((p) => (
                  <p
                    key={p}
                    className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty"
                  >
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="mt-3 space-y-2">
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-sm text-ink-muted"
                      >
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                        <span className="text-pretty">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <p className="mt-12 border-t border-primary/10 pt-6 text-sm text-ink-muted">
            Questions about this policy? Contact California Dental Meeting at{" "}
            <a
              href="mailto:ray.yabardental@gmail.com"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              ray.yabardental@gmail.com
            </a>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
