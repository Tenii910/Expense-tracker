import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PWARegister } from "@/components/pwa-register";
import { AuthGuard } from "@/components/auth-guard";
import { BackendProvider } from "@/lib/backend-provider";
import { AppFrame } from "@/components/app-frame";

export const metadata: Metadata = {
  title: "Expense Tracker — Track your spending",
  description:
    "A clean, fast expense tracker to manage your finances. Add, edit, and categorize expenses with ease.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Expense Tracker",
  },
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-surface text-text-primary antialiased">
        <BackendProvider>
          <ThemeProvider>
            <AppFrame>
              <AuthGuard>{children}</AuthGuard>
            </AppFrame>
            <PWARegister />
          </ThemeProvider>
        </BackendProvider>
      </body>
    </html>
  );
}
