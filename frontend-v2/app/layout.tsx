import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sworn — Authorization infrastructure for autonomous agents",
  description: "Authorization infrastructure for autonomous agents.",
  keywords: ["autonomous payments", "AI authorization", "agentic payments", "payment infrastructure"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans bg-paper text-ink antialiased flex flex-col min-h-screen selection:bg-accent/15 selection:text-ink">
        {children}
      </body>
    </html>
  );
}
