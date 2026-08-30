"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const FAQS = [
  {
    id: "authorization-layer",
    question: "Why authorize before agent payments?",
    answer: (
      <>
        Agent intent can shift between browse and checkout, so Sworn binds authorization rules before the
        run and validates them again when the agent commits to payment
      </>
    ),
  },
  {
    id: "settlement-integration",
    question: "How does Sworn fit settlement?",
    answer: (
      <>
        Sworn sits upstream of your processor and only releases a charge after the sealed policy matches
        commit-time state, merchant proof, and the price ceiling
      </>
    ),
  },
  {
    id: "policy-divergence",
    question: "What if commit diverges?",
    answer: (
      <>
        The payment is rejected with no funds transferred and Sworn writes a{" "}
        <span className="font-mono text-[13px] text-white/65">BLOCKED</span> record with the{" "}
        <span className="font-mono text-[13px] text-white/65">policy_hash</span>, merchant proof, and
        oracle snapshot from the point of failure
      </>
    ),
  },
  {
    id: "audit-record",
    question: "What record does Sworn keep?",
    answer: (
      <>
        Every resolve for a run links the policy hash to a{" "}
        <span className="font-mono text-[13px] text-white/65">SEALED</span> or{" "}
        <span className="font-mono text-[13px] text-white/65">BLOCKED</span> outcome in a hash chain
        that reviewers can verify without reading agent transcripts
      </>
    ),
  },
] as const;

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/[0.08]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-start justify-between gap-6 py-5 text-left sm:py-6"
      >
        <span className="font-sans text-[15px] font-medium leading-[1.45] tracking-[-0.02em] text-[#F4F5F7] transition-colors group-hover:text-white sm:text-[16px]">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.28, ease }}
          className="mt-1 shrink-0 text-white/35 transition-colors group-hover:text-white/55"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 5.5 7 9.5 11 5.5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease }}
            className="overflow-hidden"
          >
            <p className="max-w-[640px] pb-5 font-sans text-[14px] font-normal leading-[1.65] tracking-[-0.01em] text-white/50 sm:pb-6 sm:text-[15px]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <motion.section
      className="mx-auto w-full max-w-[720px] px-5 py-24 sm:px-8 sm:py-28"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease }}
    >
      <h2 className="mb-10 text-center font-sans text-[26px] font-medium leading-[1.15] tracking-[-0.04em] text-[#F4F5F7] sm:mb-12 sm:text-[32px]">
        Frequently asked questions
      </h2>

      <div className="border-t border-white/[0.08]">
        {FAQS.map((faq) => (
          <FaqItem
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            open={openId === faq.id}
            onToggle={() => setOpenId((current) => (current === faq.id ? null : faq.id))}
          />
        ))}
      </div>
    </motion.section>
  );
}
