"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedCounter({ value, suffix = "" }: Readonly<{ value: number; suffix?: string }>) {
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(value);

  useMotionValueEvent(motionValue, "change", (latest) => setDisplay(Math.round(latest)));

  useEffect(() => {
    const controls = animate(motionValue, value, { type: "spring", stiffness: 130, damping: 22 });
    return controls.stop;
  }, [motionValue, value]);

  return <span>{display.toLocaleString()}{suffix}</span>;
}
