"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ProposedTransactionProps {
  product: string;
  amount: number | null;
  merchant?: string;
  state: "pending" | "paid" | "blocked";
}

export function ProposedTransaction({
  product,
  amount,
  merchant = "Northbridge Cloud",
  state,
}: ProposedTransactionProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "mt-6 rounded-2xl border px-5 py-5 sm:px-6 sm:py-6",
        state === "pending" && "border-white/[0.08] bg-white/[0.02]",
        state === "paid" && "border-[#10B981]/30 bg-[#10B981]/[0.06]",
        state === "blocked" && "border-[#EF4444]/25 bg-[#EF4444]/[0.05]",
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
        {state === "pending" ? "Proposed transaction" : state === "paid" ? "Paid transaction" : "Blocked transaction"}
      </p>
      <p className="mt-2 text-[20px] font-medium tracking-[-0.02em] text-[#F4F5F7] sm:text-[22px]">
        {product}
        {amount != null && (
          <span className="text-white/70"> · ${amount}</span>
        )}
      </p>
      <p className="mt-1 text-[13px] text-white/40">{merchant}</p>
      {state === "pending" && (
        <p className="mt-3 text-[13px] text-white/45">
          Payment not yet made — awaiting SWORN verification.
        </p>
      )}
    </motion.div>
  );
}
