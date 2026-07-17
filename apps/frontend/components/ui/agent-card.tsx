"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

import { GlassPanel } from "./glass-panel";
import { StatusDot, type SignalStatus } from "./status";

interface AgentCardProps {
  name: string;
  status: SignalStatus;
  reasoning: string;
  index?: number;
}

export function AgentCard({ name, status, reasoning, index = 0 }: Readonly<AgentCardProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 170, damping: 20 }}
    >
      <GlassPanel hoverable className="min-h-36 p-4">
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-secondary/15 text-accent-secondary">
              <Bot size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-display text-sm font-semibold text-ink">{name}</h3>
              <StatusDot status={status} />
            </div>
          </div>
          <motion.span
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-status-migrating"
            animate={
              status === "migrating"
                ? { scale: [1, 1.55, 1], opacity: [0.9, 0.35, 0.9] }
                : undefined
            }
            transition={{ repeat: Infinity, duration: 1.6 }}
            aria-label={`${name} is ${status}`}
          />
        </div>
        <p className="relative mt-5 line-clamp-2 text-sm leading-6 text-ink-muted">{reasoning}</p>
      </GlassPanel>
    </motion.div>
  );
}
