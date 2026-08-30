"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";

interface ResultResolutionProps {
  product: string;
  amount: number | null;
  orderId?: string | null;
  blocked?: boolean;
  blockReason?: string | null;
  onNewRun?: () => void;
}

export function ResultResolution({
  product,
  amount,
  orderId,
  blocked,
  blockReason,
  onNewRun,
}: ResultResolutionProps) {
  if (blocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 space-y-5 rounded-2xl border border-[#EF4444]/25 bg-[#EF4444]/[0.06] px-6 py-7"
      >
        <h3 className="text-[20px] font-medium text-[#EF4444]">No payment was made</h3>
        <p className="text-[15px] leading-relaxed text-white/50">
          {blockReason ?? "SWORN blocked this transaction before any money moved."}
        </p>
        <a
          href="/store/orders"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[13px] text-white/45 hover:text-white/70"
        >
          Check store — no order should exist
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 space-y-6 border-t border-white/[0.06] pt-10"
    >
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#10B981]">
          Complete
        </p>
        <p className="text-[17px] leading-relaxed text-white/70">
          {amount != null
            ? `Your agent bought ${product} for $${amount}. SWORN verified the purchase against your authorization before releasing payment.`
            : `Your agent completed the purchase. SWORN verified it first.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {orderId && (
          <a
            href={`/store/order/${orderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-[#10B981]/40",
              "bg-[#10B981]/10 px-5 py-2.5 text-[13px] font-medium text-[#10B981]",
              "transition-colors hover:bg-[#10B981]/20",
            )}
          >
            View order in store
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {onNewRun && (
          <button
            onClick={onNewRun}
            className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[13px] font-medium text-white/60 hover:text-white"
          >
            New run
          </button>
        )}
      </div>
    </motion.div>
  );
}
