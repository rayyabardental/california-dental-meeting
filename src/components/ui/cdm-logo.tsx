import Image from "next/image";
import { cn } from "@/lib/utils";

export function CdmLogo({
  className,
  size = 56,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}): React.ReactElement {
  return (
    <span
      className={cn(
        "relative inline-block flex-none overflow-hidden rounded-full bg-sand-100 ring-1 ring-primary/10",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/cdm-logo.jpg"
        alt=""
        fill
        sizes={`${size}px`}
        priority={priority}
        className="object-cover"
      />
    </span>
  );
}
