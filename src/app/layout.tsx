import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PWARegister } from "@/components/pwa-register";
import { Header } from "@/components/header";

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
  maximumScale: 1,
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
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var d=JSON.parse(localStorage.getItem("expense-theme"));if(d&&d.state&&d.state.isDark)document.documentElement.classList.add("dark")}catch(e){}})()`
        }} />
      </head>
      <body className="bg-surface text-text-primary antialiased">
         <ThemeProvider>
          <Header />
          {children}
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
