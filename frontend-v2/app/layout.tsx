import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IISTA — Authorization for autonomous payments",
  description:
    "Intent-invariant state transition authorization. An autonomous agent can search, choose, and checkout. Only IISTA decides what moves money.",
  keywords: ["autonomous payments", "AI authorization", "agentic payments", "payment infrastructure"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
