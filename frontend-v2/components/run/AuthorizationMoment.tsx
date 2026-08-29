"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { HashChip } from "@/components/primitives/HashChip";
import type { Payment } from "@/lib/types";

interface AuthorizationMomentProps {
  authorized: boolean | null;
  blockReason?: string | null;
  payment?: Payment | null;
  budget?: number | null;
  className?: string;
}

export function AuthorizationMoment({
  authorized,
  blockReason,
  payment,
  budget,
  className,
}: AuthorizationMomentProps) {
  const waiting = authorized === null;
  const granted = authorized === true;
  const blocked = authorized === false;

  const amount =
    payment?.transaction?.amount ??
    (typeof payment?.amount === "number" ? payment.amount : null);

  const txId =
    payment?.transaction_id ??
    payment?.transaction?.invoice_id ??
    null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="section-label">SWORN decision</p>

      <AnimatePresence mode="wait">
        {waiting && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border"
          >
            <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center">
              <Loader2 className="w-4.5 h-4.5 text-ink-faint animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-muted">Awaiting DAE decision</p>
              <p className="text-xs text-ink-faint mt-0.5">
                Master secret stays in the enclave
              </p>
            </div>
          </motion.div>
        )}

        {granted && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative overflow-hidden rounded-xl border border-authorized-border bg-success-light",
              "animate-glow-pulse",
            )}
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-xl border-2 border-success/20 pointer-events-none" />

            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-light border border-authorized-border flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-base font-bold text-success">AUTHORIZED</p>
                  <p className="text-xs text-success/70">All checks passed · DAE signed</p>
                </div>
              </div>

              {/* Details */}
              {(amount != null || txId) && (
                <div className="space-y-1.5 pt-2 border-t border-authorized-border">
                  {amount != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-success/70">Amount</span>
                      <span className="text-sm font-bold text-success">${amount}</span>
                    </div>
                  )}
                  {budget != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-success/70">Authorized limit</span>
                      <span className="text-xs text-success">${budget}</span>
                    </div>
                  )}
                  {txId && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-success/70">Transaction</span>
                      <HashChip value={txId} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {blocked && (
          <motion.div
            key="blocked"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative overflow-hidden rounded-xl border border-blocked-border bg-danger-light",
              "animate-glow-pulse-danger",
            )}
          >
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger-light border border-blocked-border flex items-center justify-center">
                  <ShieldX className="w-5 h-5 text-danger" />
                </div>
                <div>
                  <p className="text-base font-bold text-danger">BLOCKED</p>
                  <p className="text-xs text-danger/70">DAE refused to sign</p>
                </div>
              </div>

              {/* Reason */}
              {blockReason && (
                <div className="pt-2 border-t border-blocked-border">
                  <p className="text-xs text-danger leading-relaxed">{blockReason}</p>
                </div>
              )}

              {/* Stats */}
              <div className="pt-2 border-t border-blocked-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-danger/70">Payment</span>
                  <span className="text-sm font-bold text-danger">$0</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
