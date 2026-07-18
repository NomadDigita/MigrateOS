"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { importRepository } from "@/lib/platform-api";
import { useAuth } from "@/components/auth/auth-provider";

export function ImportForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const { user, signIn } = useAuth();
  const mutation = useMutation({
    mutationFn: importRepository,
    onSuccess: ({ job_id: jobId }) => router.push(`/jobs/${jobId}`),
  });

  return (
    <form
      className="mt-8 flex max-w-2xl flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!user) {
          void signIn("github");
          return;
        }
        mutation.mutate(url.trim());
      }}
    >
      <label className="text-sm font-semibold text-ink" htmlFor="repository-url">
        Public GitHub repository URL
      </label>
      <input
        required
        id="repository-url"
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://github.com/owner/repository"
        aria-describedby={mutation.isError ? "repository-url-error" : undefined}
        className="rounded-xl border bg-surface px-4 py-3 text-ink outline-none transition focus-visible:border-accent-primary focus-visible:ring-2 focus-visible:ring-accent-primary/30"
      />
      <button
        disabled={mutation.isPending}
        className="rounded-xl bg-accent-primary px-5 py-3 font-bold text-canvas transition hover:bg-accent-primary/90 disabled:cursor-wait disabled:opacity-60"
      >
        {mutation.isPending ? "Creating analysis job…" : "Analyze repository"}
      </button>
      {!user ? (
        <button
          type="button"
          onClick={() => void signIn("google")}
          className="text-sm font-semibold text-accent-primary hover:underline"
        >
          Or continue with Google
        </button>
      ) : null}
      {mutation.isError ? (
        <p id="repository-url-error" className="text-sm text-status-failed" role="alert">
          {mutation.error.message}
        </p>
      ) : null}
    </form>
  );
}
