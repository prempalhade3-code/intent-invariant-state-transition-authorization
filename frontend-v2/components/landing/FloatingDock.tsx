"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function FloatingDock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 right-6 z-30 hidden flex-col items-end gap-2 sm:flex"
    >
      <Link
        href="/lab"
        className="group flex items-center gap-2 rounded-full border border-border bg-paper/90 px-4 py-2.5 text-[13px] font-medium text-ink shadow-sm backdrop-blur-md transition-all hover:border-ink hover:shadow-md"
      >
        Incident Lab
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    </motion.div>
  );
}
