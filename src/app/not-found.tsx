import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound(): React.ReactElement {
  return (
    <section className="relative isolate flex flex-1 items-center overflow-hidden gradient-mesh py-24 lg:py-32">
      <div className="pointer-events-none absolute -top-40 right-1/2 -z-10 h-[40rem] w-[40rem] translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      <Container size="default">
        <div className="mx-auto max-w-xl text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
            <Compass className="h-7 w-7" />
          </span>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
            404 — Page not found
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl text-balance">
            This page seems to have graduated.
          </h1>
          <p className="mt-4 text-lg text-ink-muted text-pretty">
            The page you&apos;re looking for doesn&apos;t exist or may have
            moved. Explore our current programs or head back home.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/courses" variant="primary" size="lg">
              Explore courses
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/" variant="ghost" size="lg">
              Back to home
            </Button>
          </div>
          <p className="mt-8 text-sm text-ink-muted">
            Looking for your registration?{" "}
            <a
              href="/orders"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Order lookup
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
