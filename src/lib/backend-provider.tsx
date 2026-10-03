"use client";

import { useEffect, type ReactNode } from "react";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import { useAuthStore, type UserSession } from "@/lib/auth-store";
import { clearUserData, loadUserData } from "@/lib/supabase-data";

export function BackendProvider({ children }: { children: ReactNode }) {
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const setBackendReady = useAuthStore((state) => state.setBackendReady);
  const setBackendError = useAuthStore((state) => state.setBackendError);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setBackendError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env, then restart the dev server.",
      );
      setInitialized(true);
      setBackendReady(true);
      return;
    }

    const supabase = getSupabaseClient();
    let mounted = true;
    let generation = 0;
    let activeUserId: string | null = null;

    const applySession = async (user: {
      id: string;
      email?: string;
      created_at?: string;
      user_metadata?: Record<string, unknown>;
    } | null) => {
      if (!mounted) return;

      if (!user) {
        generation += 1;
        activeUserId = null;
        clearUserData();
        setCurrentUser(null);
        setBackendError(null);
        setBackendReady(true);
        setInitialized(true);
        return;
      }

      if (activeUserId === user.id) {
        setInitialized(true);
        return;
      }

      activeUserId = user.id;
      const requestGeneration = ++generation;
      setCurrentUser({
        id: user.id,
        name: String(user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User"),
        email: user.email ?? "",
        createdAt: user.created_at ?? new Date().toISOString(),
      });
      setBackendReady(false);
      setBackendError(null);
      setInitialized(true);

      try {
        const profile = await loadUserData(user.id);
        if (!mounted || generation !== requestGeneration) return;
        if (profile) {
          setCurrentUser((current: UserSession | null) =>
            current?.id === user.id
              ? { ...current, name: profile.display_name, email: profile.email }
              : current,
          );
        }
      } catch (error) {
        if (!mounted || generation !== requestGeneration) return;
        setBackendError(
          error instanceof Error ? error.message : "Could not load your Supabase data.",
        );
      } finally {
        if (mounted && generation === requestGeneration) setBackendReady(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer Supabase queries until after the auth callback releases its lock.
      window.setTimeout(() => void applySession(session?.user ?? null), 0);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setBackendError(error.message);
      void applySession(data.session?.user ?? null);
    }).catch((error: unknown) => {
      if (!mounted) return;
      setBackendError(error instanceof Error ? error.message : "Could not restore your Supabase session.");
      setInitialized(true);
      setBackendReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setBackendError, setBackendReady, setCurrentUser, setInitialized]);

  return <>{children}</>;
}