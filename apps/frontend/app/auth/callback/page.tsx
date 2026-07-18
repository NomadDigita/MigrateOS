"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Finishing your secure sign-in…");
  useEffect(() => {
    const code = params.get("code");
    const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/dashboard";
    if (!code) {
      setMessage("The sign-in response was incomplete. Please return home and try again.");
      return;
    }
    void getSupabaseBrowserClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error }: { error: AuthError | null }) => {
        if (error) setMessage(error.message);
        else router.replace(next);
      });
  }, [params, router]);
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6 text-center text-ink-muted">
      {message}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-canvas px-6 text-center text-ink-muted">
          Preparing secure sign-in…
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
