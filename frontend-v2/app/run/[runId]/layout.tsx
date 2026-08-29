import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SWORN — Live execution",
};

export default function RunLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
