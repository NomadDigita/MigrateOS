"use client";

import { Github, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";

export function WorkspaceGate({ children }: Readonly<{ children: ReactNode }>) {
  const { ready, user, signIn } = useAuth();
  if (!ready)
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <LoaderCircle className="animate-spin text-accent-primary" />
      </div>
    );
  if (user) return <>{children}</>;
  return (
    <GlassPanel className="mx-auto mt-16 max-w-xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-primary">
        Private workspace
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold">
        Sign in to open your command center.
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink-muted">
        Your repositories, plans, reports, and live activity stay visible only to your account.
      </p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => void signIn("github")}
          className="rounded-xl border border-surface-muted bg-surface-raised px-4 py-3 font-semibold transition hover:border-accent-primary"
        >
          <Github className="mr-2 inline" size={18} /> Continue with GitHub
        </button>
        <button
          onClick={() => void signIn("google")}
          className="rounded-xl bg-accent-primary px-4 py-3 font-semibold text-canvas transition hover:brightness-110"
        >
          Continue with Google
        </button>
      </div>
      <p className="mt-4 text-xs text-ink-muted">
        Google sign-in supports Gmail accounts. No password or email-link sign-in is offered.
      </p>
    </GlassPanel>
  );
}
