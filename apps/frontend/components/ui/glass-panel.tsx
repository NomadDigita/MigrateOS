"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface GlassPanelProps extends HTMLMotionProps<"section"> {
  children: ReactNode;
  hoverable?: boolean;
}

export function GlassPanel({ children, className, hoverable = false, ...props }: GlassPanelProps) {
  return (
    <motion.section
      className={cn(
        "glass-grain relative overflow-hidden rounded-2xl border border-surface-muted/80 bg-surface/70 p-5 shadow-glass backdrop-blur-xl",
        "before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-ink/30 before:to-transparent",
        hoverable && "transition-shadow duration-300 hover:-translate-y-0.5 hover:shadow-glow",
        className,
      )}
      whileHover={hoverable ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </motion.section>
  );
}
