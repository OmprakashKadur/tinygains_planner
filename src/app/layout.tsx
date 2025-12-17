import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/toast-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FocusFlow Pro | Intent-Driven Productivity",
    template: "%s | FocusFlow Pro",
  },
  description:
    "Transform focus into measurable outcomes. The intent-driven planner for high performers.",
  metadataBase: new URL("https://focusflow.pro"),
  openGraph: {
    title: "FocusFlow Pro",
    description: "Transform focus into measurable outcomes.",
    url: "https://focusflow.pro",
    siteName: "FocusFlow Pro",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusFlow Pro",
    description: "Transform focus into measurable outcomes.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
