"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { WelcomeScreen } from "./welcome-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Allow login and signup pages to render freely
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  // Prevent SSR hydration mismatch before client rehydrates from localStorage
  if (!mounted) {
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

  return <>{children}</>;
}
