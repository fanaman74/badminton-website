import type { Metadata } from "next";
import { Archivo, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-schibsted",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eastside Smashers",
  description: "Team scheduling, RSVPs and sessions",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${schibsted.variable} h-full`}
      style={{ "--font-display": `var(--font-archivo)`, "--font-body": `var(--font-schibsted)` } as React.CSSProperties}>
      <body className="h-full antialiased" style={{ background: "var(--bg)", color: "var(--ink)", fontFamily: "var(--font-body)" }}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
