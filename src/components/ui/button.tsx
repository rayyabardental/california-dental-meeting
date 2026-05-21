import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-medium tracking-tight transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.99] shadow-[0_8px_20px_-8px_rgba(10,37,64,0.55)]",
        gold:
          "bg-gold text-primary hover:bg-gold-300 hover:scale-[1.02] active:scale-[0.99] shadow-[0_8px_20px_-8px_rgba(201,168,76,0.6)]",
        accent:
          "bg-accent text-white hover:bg-accent-300 hover:scale-[1.02] active:scale-[0.99] shadow-[0_8px_20px_-8px_rgba(0,180,216,0.55)]",
        ghost:
          "bg-transparent text-primary hover:bg-primary/5 border border-primary/15",
        outline:
          "bg-transparent text-primary border border-primary/25 hover:border-primary/60 hover:bg-white",
        link: "bg-transparent text-primary underline-offset-4 hover:underline px-0 py-0",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-full",
        md: "h-11 px-6 text-[0.95rem] rounded-full",
        lg: "h-13 px-7 text-base rounded-full",
        xl: "h-14 px-8 text-base rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type StyleProps = VariantProps<typeof buttonStyles>;

export type ButtonProps =
  | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement> & StyleProps)
  | ({
      href: string;
      external?: boolean;
      className?: string;
      children: ReactNode;
    } & StyleProps);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    if ("href" in props && props.href) {
      const { href, external, variant, size, className, children } = props;
      const classes = cn(buttonStyles({ variant, size }), className);
      return external ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={classes}
        >
          {children}
        </a>
      ) : (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }
    const { variant, size, className, children, ...rest } = props;
    return (
      <button
        ref={ref}
        className={cn(buttonStyles({ variant, size }), className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
