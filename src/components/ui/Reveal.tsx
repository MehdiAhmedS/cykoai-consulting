"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Fade + rise reveal, triggered once the element enters view. Deliberately
 * avoids animating `filter: blur()` — it's a real shader cost, and this
 * component is reused on ~20 elements across the page, several of which
 * can enter the viewport in the same scroll frame during a fast scroll.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.3 }}
      variants={variants}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
