"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReportReadyHintProps {
  visible: boolean;
  reportSectionId: string;
}

export function ReportReadyHint({ visible, reportSectionId }: ReportReadyHintProps) {
  const [show, setShow] = useState(false);
  const seenRef = useRef(false);

  useEffect(() => {
    seenRef.current = false;
    setShow(false);
  }, [reportSectionId]);

  useEffect(() => {
    if (!visible || seenRef.current) return;
    seenRef.current = true;
    const timer = window.setTimeout(() => setShow(true), 500);
    return () => window.clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    if (!show) return;
    const section = document.getElementById(reportSectionId);
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShow(false);
      },
      { threshold: 0.05, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [show, reportSectionId]);

  const scrollToReport = () => {
    document.getElementById(reportSectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6">
          <motion.button
            type="button"
            onClick={scrollToReport}
            initial={{ y: 120, opacity: 0, scale: 0.86 }}
            animate={{
              y: [120, -28, 10, -4, 0],
              opacity: [0, 1, 1, 1, 1],
              scale: [0.86, 1.04, 0.98, 1.01, 1],
            }}
            exit={{ y: 40, opacity: 0, scale: 0.92 }}
            transition={{
              duration: 1.05,
              times: [0, 0.38, 0.58, 0.78, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-auto w-[min(100%,360px)] overflow-hidden rounded-[20px] border border-[#10B981]/25 bg-[#12141a] text-left shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="border-b border-white/[0.06] px-4 py-3">
              <span className="rounded-full bg-[#10B981] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#0A0B0D]">
                Authorized
              </span>
            </div>
            <div className="px-4 py-4">
              <p className="font-sans text-[14px] font-semibold tracking-[-0.02em] text-[#F4F5F7]">
                Transaction has been authorized
              </p>
              <p className="mt-1.5 font-mono text-[11px] leading-[1.5] text-white/40">
                Check more details below ↓
              </p>
            </div>
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
