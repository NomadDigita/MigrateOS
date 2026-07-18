"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Braces, CircleCheckBig, Sparkles, Terminal } from "lucide-react";

const signals = [
  ["Source", "Snapshot pinned", "text-accent-primary", "left-[7%] top-[13%]"],
  ["Planner", "Evidence linked", "text-status-validating", "right-[7%] top-[15%]"],
  ["Review", "Approval ready", "text-accent-tertiary", "bottom-[15%] right-[7%]"],
] as const;

export function CodingClubStage() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="club-stage relative isolate overflow-hidden rounded-[2.25rem] border border-white/20 shadow-[0_40px_120px_rgba(3,5,18,0.56)]"
      aria-labelledby="coding-club-heading"
    >
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { scale: [1, 1.035, 1], x: [0, -7, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-5"
      >
        <Image
          alt="An original MigrateOS coding-club agent working at a laptop in a neon-lit developer room"
          className="h-full w-full object-cover"
          fill
          priority={false}
          sizes="(max-width: 1280px) 100vw, 1180px"
          src="/images/migrateos-coding-club.png"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,5,18,0.92)_0%,rgba(4,5,18,0.72)_38%,rgba(4,5,18,0.18)_70%,rgba(4,5,18,0.42)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_78%,rgba(27,216,235,0.2),transparent_25%),radial-gradient(circle_at_75%_14%,rgba(247,177,77,0.17),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(3,4,16,0.55))]" />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: ["-120%", "155%"], opacity: [0, 0.8, 0] }}
        transition={{ duration: 6.8, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
        className="absolute -top-1/2 bottom-[-50%] w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl"
      />
      <div aria-hidden="true" className="club-scanlines absolute inset-0 opacity-30" />
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion ? undefined : { opacity: [0.35, 0.8, 0.35], scale: [0.96, 1.05, 0.96] }
        }
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[51%] top-[45%] h-40 w-40 rounded-full bg-accent-secondary/35 blur-[78px]"
      />
      {signals.map(([title, detail, tone, position], index) => (
        <motion.div
          key={title}
          animate={reduceMotion ? undefined : { y: [0, index % 2 === 0 ? -9 : 9, 0] }}
          transition={{ duration: 3.8 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute z-10 hidden rounded-2xl border border-white/20 bg-[#0b1026]/55 px-4 py-3 shadow-2xl backdrop-blur-xl 2xl:block ${position}`}
        >
          <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${tone}`}>{title}</p>
          <p className="mt-1 text-xs font-semibold text-white/85">{detail}</p>
        </motion.div>
      ))}
      <div className="relative z-10 flex min-h-[560px] max-w-[690px] flex-col justify-end p-5 sm:min-h-[590px] sm:p-12">
        <div className="club-console max-w-xl rounded-[1.75rem] border border-white/20 bg-[#0b1026]/52 p-6 shadow-[0_28px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-status-validating">
            <Sparkles size={15} /> The MigrateOS coding club
          </p>
          <h2
            id="coding-club-heading"
            className="club-type mt-5 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-white sm:text-5xl"
          >
            Where legacy code gets its next chapter.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/70">
            A calm room for hard problems: agent intelligence, durable evidence, and human judgment
            working in the same frame.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-md">
              <Braces className="text-accent-primary" size={19} />
              <p className="mt-4 text-sm font-bold text-white">Code, contextualized</p>
              <p className="mt-1 text-xs leading-5 text-white/60">
                Every finding traces back to the source.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-md">
              <CircleCheckBig className="text-status-validating" size={19} />
              <p className="mt-4 text-sm font-bold text-white">Change, governed</p>
              <p className="mt-1 text-xs leading-5 text-white/60">
                Execution waits for an explicit approval.
              </p>
            </div>
          </div>
          <div
            className="mt-5 hidden items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-[10px] text-white/55 sm:flex"
            aria-hidden="true"
          >
            <span className="h-2 w-2 rounded-full bg-status-success shadow-[0_0_12px_hsl(var(--status-success))]" />
            <span className="club-code-stream">
              agent/migrate / tracing source -&gt; plan -&gt; proof
            </span>
            <span className="ml-auto text-accent-primary">LIVE</span>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/[0.06]">
            <Terminal size={14} className="text-accent-tertiary" />
          </span>
          Designed for responsible velocity
        </div>
      </div>
    </section>
  );
}
