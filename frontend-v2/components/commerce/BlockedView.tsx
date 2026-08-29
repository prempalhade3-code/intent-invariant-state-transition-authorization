"use client";
import { motion } from "framer-motion";
import { ShieldX, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

interface BlockedViewProps {
  blockReason: string | null;
  attemptedAmount?: number | null;
  authorizedBudget?: number | null;
  attemptedProduct?: string | null;
  className?: string;
}

export function BlockedView({
  blockReason,
  attemptedAmount,
  authorizedBudget,
  attemptedProduct,
  className,
}: BlockedViewProps) {
  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-3 py-4">
        <motion.div
          className="w-12 h-12 bg-danger-light border border-blocked-border rounded-2xl flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <ShieldX className="w-6 h-6 text-danger" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-ink">Transaction blocked</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            IISTA stopped this before payment
          </p>
        </div>
      </div>

      {/* Comparison table */}
      {(attemptedAmount != null || authorizedBudget != null) && (
        <div className="bg-paper border border-blocked-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-danger-light border-b border-blocked-border">
            <p className="text-xs font-semibold text-danger uppercase tracking-wider">
              What happened
            </p>
          </div>
          <div className="divide-y divide-border">
            {attemptedProduct && (
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-xs text-ink-faint">Agent attempted</span>
                <span className="text-xs font-medium text-ink">{attemptedProduct}</span>
              </div>
            )}
            {attemptedAmount != null && (
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-xs text-ink-faint">Invoice amount</span>
                <span className="text-sm font-bold text-danger">${attemptedAmount}</span>
              </div>
            )}
            {authorizedBudget != null && (
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-xs text-ink-faint">You authorized</span>
                <span className="text-sm font-bold text-success">${authorizedBudget}</span>
              </div>
            )}
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-xs text-ink-faint">IISTA decision</span>
              <span className="text-sm font-bold text-danger">BLOCKED</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-xs text-ink-faint">Payment</span>
              <span className="text-sm font-bold text-ink">$0</span>
            </div>
          </div>
        </div>
      )}

      {/* Reason */}
      {blockReason && (
        <div className="flex items-start gap-2.5 p-3 bg-danger-light border border-blocked-border rounded-xl">
          <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-xs text-danger leading-relaxed">{blockReason}</p>
        </div>
      )}
    </motion.div>
  );
}
