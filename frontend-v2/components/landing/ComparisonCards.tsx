"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

const PROMPT = "Find a VPS under $25 and purchase from the approved marketplace.";

function ChatBubble({ children, faded }: { children: React.ReactNode; faded?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 text-[13px] leading-[1.55] tracking-[-0.01em]",
        faded
          ? "bg-[#12141a] text-white/35"
          : "border border-white/[0.08] bg-[#161820] text-[#F4F5F7]",
      )}
    >
      {children}
    </div>
  );
}

function TypingText({ text, active }: { text: string; active: boolean }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!active) {
      setShown("");
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [text, active]);

  return <span>{shown}</span>;
}

export function ComparisonCards() {
  const [inView, setInView] = useState(false);

  return (
    <motion.section
      className="mx-auto w-full max-w-[920px] px-5 sm:px-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      onViewportEnter={() => setInView(true)}
    >
      <div className="mb-10 text-center">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
          Why a seal, not a prompt
        </p>
        <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.04em] text-[#F4F5F7] sm:text-[32px]">
          Power your agents to spend
          <br />
          <span className="font-semibold">within the word they were given</span>
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="rounded-[20px] border border-white/[0.08] bg-[#12141a]/50 p-5 sm:p-6"
        >
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
            Without Sworn
          </p>
          <div className="space-y-3">
            <ChatBubble>{PROMPT}</ChatBubble>
            <ChatBubble faded>
              <span className="font-medium text-white/50">Agent</span>
              <p className="mt-1.5">
                Checkout complete. $189 VPS Premium added to cart. Processing payment…
              </p>
              <p className="mt-2 text-white/35">No independent check between intent and settlement.</p>
            </ChatBubble>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18, ease }}
          className="rounded-[20px] border border-[#10B981]/20 bg-[#12141a] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-[#10B981] px-3 py-1 font-mono text-[10px] text-[#0A0B0D]">
              With Sworn
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/35">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#10B981]" />
              live
            </span>
          </div>
          <div className="space-y-3">
            <ChatBubble>{PROMPT}</ChatBubble>
            <ChatBubble>
              <span className="font-semibold">Agent, sealed by Sworn</span>
              <p className="mt-1.5 font-normal text-white/50">
                <TypingText
                  active={inView}
                  text="Invoice $189 exceeds $25 ceiling. DAE rejected signature. Payment blocked."
                />
              </p>
              <div className="mt-3 rounded-lg border border-white/[0.08] bg-[#0A0B0D] px-3 py-2 font-mono text-[10px] text-white/45">
                <span className="font-medium text-[#E5484D]">blocked</span> · policy_hash match · oracle stale
              </div>
            </ChatBubble>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
