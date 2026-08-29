"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const PHRASES = [
  "outside its word.",
  "without sealed proof.",
  "when state diverges.",
];

const transition = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

export function AnimatedHeadline() {
  const [active, setActive] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth);
    }
  }, [active]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((index) => (index + 1) % PHRASES.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <h1 className="text-balance text-center text-[30px] font-medium leading-[1.12] tracking-[-0.04em] text-ink sm:text-[34px] md:text-[38px]">
      <span className="block">An autonomous agent can act freely,</span>
      <span className="block">but it cannot authorize a transaction</span>
      <span className="mt-1 block">
        <motion.span
          animate={{ width: width ?? "auto" }}
          transition={transition}
          className="relative mx-auto inline-block overflow-hidden text-accent"
          style={{ width: width ? width : undefined }}
        >
          <span
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap"
          >
            {PHRASES[active]}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={PHRASES[active]}
              initial={{ opacity: 0, y: "0.5em" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-0.5em" }}
              transition={transition}
              className="block whitespace-nowrap"
            >
              {PHRASES[active]}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </span>
    </h1>
  );
}
