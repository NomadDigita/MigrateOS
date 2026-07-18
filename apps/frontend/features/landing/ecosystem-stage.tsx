"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bot, CheckCircle2, Database, GitBranch, ShieldCheck } from "lucide-react";

const stations = [
  { label: "Source", icon: GitBranch, tone: "text-accent-tertiary", position: "left-5 top-14" },
  { label: "Evidence", icon: Database, tone: "text-status-validating", position: "right-5 top-24" },
  { label: "Agents", icon: Bot, tone: "text-accent-secondary", position: "bottom-12 left-10" },
  { label: "Review", icon: ShieldCheck, tone: "text-status-failed", position: "bottom-7 right-8" },
];

export function EcosystemStage() {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 7, repeat: Infinity, ease: "linear" };

  return (
    <section
      aria-label="MigrateOS ecosystem animation"
      className="relative isolate min-h-[470px] overflow-hidden rounded-[2rem] border border-white/15 bg-[#100b25] p-6 shadow-[0_28px_90px_rgba(89,52,176,0.35)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(240,171,252,0.28),transparent_26%),radial-gradient(circle_at_78%_26%,rgba(249,199,79,0.22),transparent_22%),radial-gradient(circle_at_58%_82%,rgba(251,113,133,0.2),transparent_28%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={transition}
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent-tertiary/60"
      />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ ...transition, duration: 11 }}
        className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-status-validating/70"
      />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.8rem] border border-white/40 bg-white/12 shadow-[0_0_55px_rgba(240,171,252,0.65)] backdrop-blur-xl"
      >
        <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-white via-status-validating to-accent-tertiary p-[2px]">
          <span className="grid h-full w-full place-items-center rounded-[0.85rem] bg-[#160d32]">
            <CheckCircle2 className="text-white" size={24} />
          </span>
        </span>
      </motion.div>
      {stations.map(({ label, icon: Icon, tone, position }, index) => (
        <motion.div
          key={label}
          animate={reduceMotion ? undefined : { y: [0, index % 2 ? -8 : 8, 0] }}
          transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute ${position} rounded-2xl border border-white/15 bg-[#1c1240]/80 px-3 py-2.5 shadow-xl backdrop-blur-md`}
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white">
            <Icon className={tone} size={15} />
            {label}
          </span>
        </motion.div>
      ))}
      <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/15 bg-[#0d0820]/70 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
          <span>Modernization signal</span>
          <span className="flex items-center gap-2 text-status-validating">
            <span className="h-2 w-2 rounded-full bg-status-validating" /> Live
          </span>
        </div>
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {[40, 66, 52, 84, 62, 92, 74, 48, 80, 58, 96, 70].map((height, index) => (
            <motion.span
              key={`${height}-${index}`}
              animate={
                reduceMotion
                  ? undefined
                  : { height: [`${height}%`, `${Math.max(28, height - 26)}%`, `${height}%`] }
              }
              transition={{ duration: 1.6 + index * 0.08, repeat: Infinity, ease: "easeInOut" }}
              className="w-full rounded-full bg-gradient-to-t from-status-failed via-accent-tertiary to-status-validating"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
