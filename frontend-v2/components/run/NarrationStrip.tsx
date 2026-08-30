"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import type { ChapterId } from "@/lib/narrative";
import { narrationLine } from "@/lib/narrative";
import type { ViewModel } from "@/lib/reduce";
import type { StoreSnapshot } from "@/lib/types";

interface NarrationStripProps {
  activeChapter: ChapterId;
  view: ViewModel;
  store: StoreSnapshot;
  className?: string;
}

export function NarrationStrip({
  activeChapter,
  view,
  store,
  className,
}: NarrationStripProps) {
  const line = narrationLine(activeChapter, view, store);

  return (
    <div
      className={cn(
        "shrink-0 border-t border-white/[0.06] bg-[#0D0E12]/80 px-5 py-3 sm:px-8 lg:px-10",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={activeChapter + line.slice(0, 24)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
          className="text-[13px] leading-relaxed text-white/55 sm:text-[14px]"
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
