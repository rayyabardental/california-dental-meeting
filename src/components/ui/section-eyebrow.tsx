import { cn } from "@/lib/utils";

export function SectionEyebrow({
  children,
  className,
  tone = "accent",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "accent" | "gold" | "primary";
}): React.ReactElement {
  const tones = {
    accent: "text-accent before:bg-accent",
    gold: "text-gold before:bg-gold",
    primary: "text-primary before:bg-primary",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] before:h-px before:w-8 before:content-[''] before:inline-block",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
