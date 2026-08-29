import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SWORN — Authorization infrastructure for autonomous agents",
  description:
    "Sworn to execute. Authorization infrastructure for autonomous agents.",
  keywords: ["autonomous payments", "AI authorization", "agentic payments", "payment infrastructure"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
