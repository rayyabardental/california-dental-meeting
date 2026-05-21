import { cn } from "@/lib/utils";

export function ToothMark({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "solid";
}): React.ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-7 w-7", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.2c3.7 0 6 1.6 8 1.6 2.5 0 4.5-1 4.5 4.4 0 4.6-1.4 8.4-3 12.5-1 2.6-1.5 6.7-3.7 6.7-2 0-2.4-3.7-3.5-7-.5-1.4-1-2-2.3-2s-1.8.6-2.3 2c-1.1 3.3-1.5 7-3.5 7-2.2 0-2.7-4.1-3.7-6.7-1.6-4.1-3-7.9-3-12.5 0-5.4 2-4.4 4.5-4.4 2 0 4.3-1.6 8-1.6Z"
        fill={variant === "solid" ? "url(#tg)" : "none"}
        stroke="currentColor"
        strokeWidth={variant === "solid" ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToothPatternBg({
  className,
}: {
  className?: string;
}): React.ReactElement {
  return (
    <svg
      className={cn(
        "absolute inset-0 -z-10 h-full w-full opacity-[0.05]",
        className,
      )}
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="toothpattern"
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(8)"
        >
          <path
            d="M40 18c4 0 6 1.6 8.5 1.6 2.7 0 4.5-.8 4.5 4 0 4-1.4 7.4-3 11-.9 2.3-1.4 5.9-3.4 5.9-1.8 0-2.2-3.3-3.2-6.2-.4-1.2-.9-1.7-2.4-1.7s-2 .5-2.4 1.7c-1 2.9-1.4 6.2-3.2 6.2-2 0-2.5-3.6-3.4-5.9-1.6-3.6-3-7-3-11 0-4.8 1.8-4 4.5-4 2.5 0 4.5-1.6 8.5-1.6Z"
            fill="currentColor"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#toothpattern)" />
    </svg>
  );
}
