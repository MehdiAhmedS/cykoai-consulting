"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  strength?: number;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  solid:
    "bg-ink text-void hover:shadow-[0_0_40px_rgba(173,135,82,0.35)]",
  outline:
    "border border-border-strong text-ink hover:border-white/30 hover:bg-white/[0.04]",
  ghost: "text-ink hover:bg-white/[0.06]",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-5 py-2.5 text-[0.8rem]",
  md: "px-7 py-3.5 text-[0.9rem]",
  lg: "px-9 py-4.5 text-[1rem]",
};

/**
 * Button that eases toward the cursor within its own bounds ("magnetic"),
 * with a soft spring release back to center on leave.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  variant = "solid",
  size = "md",
  className,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  function handleMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const sharedClassName = cn(
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-tight transition-[background-color,border-color,box-shadow,color] duration-300 ease-out-quart",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <motion.div style={{ x: springX, y: springY }}>
        {href ? (
          <motion.a
            href={href}
            data-cursor="link"
            whileTap={{ scale: 0.94 }}
            className={sharedClassName}
          >
            {children}
          </motion.a>
        ) : (
          <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            data-cursor="link"
            whileTap={{ scale: 0.94 }}
            className={cn(sharedClassName, "disabled:opacity-60")}
          >
            {children}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
