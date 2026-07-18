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
        "liquid-glass glass-grain relative overflow-hidden rounded-2xl border border-white/10 bg-surface/62 p-5 shadow-glass backdrop-blur-2xl",
        "before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        hoverable && "transition-shadow duration-500 hover:shadow-glow",
        className,
      )}
      whileHover={hoverable ? { y: -5, rotateX: 1, rotateY: -1, scale: 1.008 } : undefined}
      {...props}
    >
      {children}
    </motion.section>
  );
}
