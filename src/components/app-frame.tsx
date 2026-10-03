"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { ToastContainer } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuthStore } from "@/lib/auth-store";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentUser = useAuthStore((state) => state.currentUser);
  const showNavigation = Boolean(currentUser && pathname !== "/login" && pathname !== "/signup");

  return (
    <>
      <Header />
      <div className={showNavigation ? "min-h-screen pb-24 md:pl-64 md:pb-0" : "min-h-screen"}>
        {children}
      </div>
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}
