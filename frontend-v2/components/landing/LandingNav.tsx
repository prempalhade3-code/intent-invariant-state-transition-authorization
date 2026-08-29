"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled && "border-b border-border/60 bg-paper/85 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="transition-opacity hover:opacity-60" aria-label="Sworn home">
          <span className="text-[17px] font-medium tracking-[-0.03em] text-ink">Sworn</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink href="/#how">How it works</NavLink>
          <NavLink href="/lab">Incident Lab</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/lab"
            className="hidden text-[13px] font-medium text-ink-muted transition-colors hover:text-ink sm:block"
          >
            Docs
          </Link>
          <Link
            href="/#try"
            className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-paper transition-all hover:bg-ink/90 active:scale-[0.97]"
          >
            Try it
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
