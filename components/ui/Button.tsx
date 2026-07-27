import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "inverse";

const styles: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-bright shadow-[0_1px_2px_rgba(2,32,90,0.25),0_8px_24px_-8px_rgba(37,99,235,0.5)]",
  secondary:
    "bg-white text-ink border border-hairline hover:border-faint hover:bg-surface",
  ghost: "text-muted hover:text-ink",
  inverse: "bg-white text-primary-deep hover:bg-blue-50",
};

export function Button({
  href,
  onClick,
  type,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold font-display transition-all duration-200 whitespace-nowrap",
    size === "sm" && "h-9 px-4 text-sm",
    size === "md" && "h-11 px-6 text-[15px]",
    size === "lg" && "h-13 px-8 text-base",
    styles[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
