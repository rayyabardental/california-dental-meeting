import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}): React.ReactElement {
  const widths = {
    default: "max-w-6xl",
    wide: "max-w-7xl",
    narrow: "max-w-4xl",
  };
  return (
    <div className={cn("mx-auto w-full px-6 lg:px-10", widths[size], className)}>
      {children}
    </div>
  );
}
