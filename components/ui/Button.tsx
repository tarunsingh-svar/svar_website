import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "inverse"
  | "subtle"
  | "danger";

type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const styles: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-bright shadow-[0_1px_2px_rgba(2,32,90,0.25),0_8px_24px_-8px_rgba(37,99,235,0.5)]",
  secondary:
    "bg-white text-ink border border-hairline hover:border-faint hover:bg-surface",
  ghost: "text-muted hover:text-ink hover:bg-surface",
  inverse: "bg-white text-primary-deep hover:bg-blue-50",
  subtle: "bg-surface text-ink hover:bg-hairline/60",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-13 px-8 text-base",
  icon: "h-11 w-11",
  "icon-sm": "h-9 w-9",
};

type ButtonProps = {
  href?: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function Button({
  href,
  variant = "primary",
  size = "md",
  loading = false,
  asChild = false,
  className,
  children,
  disabled,
  type,
  ...props
}: ButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold font-display transition-all duration-200 whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-50",
    sizes[size],
    styles[variant],
    className
  );

  if (href) {
    if (href.startsWith("#")) {
      return (
        <a href={href} className={cls}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  if (asChild) {
    return (
      <Slot className={cls} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={cls}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
