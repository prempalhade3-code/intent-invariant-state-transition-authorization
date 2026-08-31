"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function AnimatedHeadline({ dark = false }: { dark?: boolean }) {
  return (
    <motion.h1
      className={cn(
        "text-center text-[clamp(22px,6vw,36px)] font-medium leading-[1.12] tracking-[-0.03em] sm:whitespace-nowrap sm:leading-[1.1]",
        dark ? "text-[#F4F5F7]" : "text-ink",
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
    >
      Authorization for autonomous agents
    </motion.h1>
  );
}
