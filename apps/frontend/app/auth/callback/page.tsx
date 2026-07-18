"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
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
      .then(({ error }) => {
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
