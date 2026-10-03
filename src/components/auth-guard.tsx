"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { WelcomeScreen } from "./welcome-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialized = useAuthStore((s) => s.initialized);
  const backendReady = useAuthStore((s) => s.backendReady);
  const backendError = useAuthStore((s) => s.backendError);

  // Allow login and signup pages to render freely
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  if (!initialized || (currentUser && !backendReady)) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-surface-alt">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user is not logged in, show the Welcome Landing Screen
  if (!currentUser) {
    return <WelcomeScreen />;
  }

  if (backendError) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-danger/20 bg-danger/10 p-6 text-sm text-danger">
        Could not load your account data: {backendError}
      </div>
    );
  }

  return <>{children}</>;
}
