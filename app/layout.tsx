import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthFlagsProvider } from "@/components/AuthFlags";
import { isAdminPasswordConfigured } from "@/lib/admin";

// Self-hosted variable fonts (latin subset).
//
// These used to come from next/font/google, which fetches the font files from
// Google during the build. That fetch failed intermittently here and in CI
// ("next/font/google queries have exactly one entry"), taking whole deploys down
// with it. Shipping the .woff2 files in the repo removes that build-time network
// dependency entirely — and is faster, since only the latin subset we need is
// downloaded, and it is served from our own origin.
//
// Both are variable fonts, so a single weight range file covers every weight the
// UI uses (Archivo 100-900, Schibsted Grotesk 400-900).
const archivo = localFont({
  src: "./fonts/archivo-latin-variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-archivo",
  display: "swap",
});

const schibsted = localFont({
  src: "./fonts/schibsted-grotesk-latin-variable.woff2",
  weight: "400 900",
  style: "normal",
  variable: "--font-schibsted",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VUB Smashers",
  description: "Team scheduling, RSVPs and sessions",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${schibsted.variable} h-full`}
      style={{ "--font-display": `var(--font-archivo)`, "--font-body": `var(--font-schibsted)` } as React.CSSProperties}>
      <body className="h-full antialiased" style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "var(--font-body)" }}>
        <AuthFlagsProvider adminPasswordEnabled={isAdminPasswordConfigured()}>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthFlagsProvider>
      </body>
    </html>
  );
}
