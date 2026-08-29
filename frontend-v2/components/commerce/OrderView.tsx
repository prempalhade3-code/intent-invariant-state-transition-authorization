"use client";
import { motion } from "framer-motion";
import { CheckCircle, Package, Hash, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/primitives/Badge";
import { HashChip } from "@/components/primitives/HashChip";
import type { OrderData } from "@/lib/types";

interface OrderViewProps {
  order: OrderData | null;
  className?: string;
}

export function OrderView({ order, className }: OrderViewProps) {
  if (!order) return null;

  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Confirmation header */}
      <div className="flex flex-col items-center gap-3 py-4">
        <motion.div
          className="w-12 h-12 bg-success-light border border-authorized-border rounded-2xl flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <CheckCircle className="w-6 h-6 text-success" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-ink">Order confirmed</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Simulated payment settled via SWORN
          </p>
        </div>
        <Badge variant="success" size="md" dot>
          {order.status.toUpperCase()}
        </Badge>
      </div>

      {/* Order details */}
      <div className="bg-paper border border-authorized-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-success-light border-b border-authorized-border">
          <p className="text-xs font-semibold text-success uppercase tracking-wider">Order details</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-ink-faint">Transaction</span>
            <HashChip value={order.transaction_id} />
          </div>
          {order.invoice_id && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-ink-faint">Invoice</span>
              <HashChip value={order.invoice_id} />
            </div>
          )}
          {order.domain && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-ink-faint">Domain</span>
              <span className="text-xs text-ink">{order.domain}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm font-semibold text-ink">Amount paid</span>
            <span className="text-2xl font-bold text-ink">${order.amount}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-ink-faint">
        Recorded in simulated payment ledger · No real money moved
      </div>
    </motion.div>
  );
}
