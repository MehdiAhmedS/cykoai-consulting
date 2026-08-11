"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  by?: "word" | "line";
  once?: boolean;
}

const container: Variants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.05, delayChildren: delay },
  }),
};

const item: Variants = {
  hidden: { opacity: 0, y: "110%", rotate: 2 },
  visible: {
    opacity: 1,
    y: "0%",
    rotate: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Splits text into words that rise into place, masked by overflow-hidden. */
export default function SplitText({
  children,
  className,
  delay = 0,
  once = true,
}: SplitTextProps) {
  const words = children.split(" ");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.6 }}
      variants={container}
      custom={delay}
      className={cn("inline", className)}
      aria-label={children}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.15em] pr-[0.28em]">
          <motion.span variants={item} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
