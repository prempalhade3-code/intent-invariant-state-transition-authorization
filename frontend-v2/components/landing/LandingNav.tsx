"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { triggerTryIt } from "@/lib/tryIt";

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative text-[13px] font-medium text-white/55 transition-colors hover:text-white"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-white/70 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const refreshHome = () => {
    setMenuOpen(false);
    if (window.location.pathname === "/") {
      window.location.reload();
    } else {
      window.location.href = "/";
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled || menuOpen ? "bg-[#0A0B0D]/85 backdrop-blur-xl" : "bg-transparent",
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4 sm:px-8">
          <button
            type="button"
            onClick={refreshHome}
            className="transition-opacity hover:opacity-60"
            aria-label="Sworn home"
          >
            <span className="text-[17px] font-medium tracking-[-0.03em] text-[#F4F5F7]">Sworn</span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            <NavLink href="/#how">How it works</NavLink>
            <NavLink href="/lab">Incident Lab</NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/blog"
              className="hidden text-[13px] font-medium text-white/55 transition-colors hover:text-white sm:block"
            >
              Blog
            </Link>
            <button
              type="button"
              onClick={triggerTryIt}
              className="rounded-full bg-[#10B981] px-3.5 py-2 text-[13px] font-medium text-[#0A0B0D] transition-all hover:bg-[#0ea472] active:scale-[0.97] sm:px-4"
            >
              Try it
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-white/60 transition-colors hover:text-white md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-[#0A0B0D]/95 backdrop-blur-md md:hidden"
            style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top))" }}
          >
            <nav className="flex flex-col gap-6 px-6 py-8">
              <NavLink href="/#how" onClick={closeMenu}>
                How it works
              </NavLink>
              <NavLink href="/lab" onClick={closeMenu}>
                Incident Lab
              </NavLink>
              <NavLink href="/blog" onClick={closeMenu}>
                Blog
              </NavLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
