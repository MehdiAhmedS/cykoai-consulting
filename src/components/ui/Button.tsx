import { cn } from "@/lib/utils";

type Variant = "solid" | "inverse" | "ghost" | "ghost-inverse";
type Size = "md" | "sm";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<Variant, string> = {
  // Windsor fill on light surfaces (mockup A/C .btn)
  solid: "bg-windsor text-white hover:bg-windsor-hover",
  // white fill on Windsor bands (mockup B/D .btn)
  inverse: "bg-white text-windsor hover:bg-n150",
  ghost: "border border-n300 text-windsor hover:bg-n50",
  // nav CTA on the Windsor band
  "ghost-inverse":
    "border border-white/35 text-white hover:bg-white hover:text-windsor",
};

const sizeClasses: Record<Size, string> = {
  md: "px-7 py-[15px]",
  sm: "px-[18px] py-[9px]",
};

/**
 * Flat DS button: 2px radius, 200–300ms background/color shifts only —
 * no scale, no magnetism, no shadows (§1).
 */
export default function Button({
  children,
  href,
  variant = "solid",
  size = "md",
  type = "button",
  disabled,
  className,
  onClick,
}: ButtonProps) {
  const classes = cn(
    "type-small inline-flex items-center justify-center rounded-xs font-medium",
    "transition-colors duration-250 ease-out-expo",
    "disabled:cursor-not-allowed disabled:opacity-45",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
