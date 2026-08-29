import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IISTA — Live run",
};

export default function RunLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
