"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthState = {
  user: User | null;
  ready: boolean;
  signIn: (provider: "github" | "google") => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const supabase = getSupabaseBrowserClient();
      void supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
        setUser(result.data.user);
        setReady(true);
      });
      const subscription = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setUser(session?.user ?? null);
          setReady(true);
        },
      );
      unsubscribe = () => subscription.data.subscription.unsubscribe();
    } catch {
      setReady(true);
    }
    return () => unsubscribe?.();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      signIn: async (provider) => {
        const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
          provider,
          options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
        });
        if (error) throw error;
      },
      signOut: async () => {
        await getSupabaseBrowserClient().auth.signOut();
      },
    }),
    [ready, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (!state) throw new Error("useAuth must be rendered inside AuthProvider.");
  return state;
}
