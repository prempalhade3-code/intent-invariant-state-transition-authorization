"use client";
import { motion } from "framer-motion";
import { CreditCard, Package, Building2, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CheckoutData } from "@/lib/types";

interface CheckoutViewProps {
  checkout: CheckoutData | null;
  className?: string;
}

export function CheckoutView({ checkout, className }: CheckoutViewProps) {
  if (!checkout) {
    return (
      <div className={cn("flex flex-col items-center gap-2 py-6 text-center", className)}>
        <CreditCard className="w-6 h-6 text-ink-faint" />
        <p className="text-sm text-ink-faint">Checkout being created…</p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Order summary */}
      <div className="bg-paper border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Order summary</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{checkout.product_id}</p>
              <p className="text-xs text-ink-faint">Monthly subscription</p>
            </div>
            <p className="text-sm font-bold text-ink">${checkout.price}</p>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-sm text-ink-muted font-medium">Total due today</span>
            <span className="text-xl font-bold text-ink">${checkout.price}</span>
          </div>
        </div>
      </div>

      {/* Merchant identity */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 p-3 bg-paper border border-border rounded-xl">
          <Building2 className="w-4 h-4 text-ink-faint flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-faint">Merchant</p>
            <p className="text-sm font-medium text-ink truncate">{checkout.merchant_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 bg-paper border border-border rounded-xl">
          <Globe className="w-4 h-4 text-ink-faint flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-faint">Domain</p>
            <p className="text-sm font-medium text-ink truncate">{checkout.domain}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 bg-accent-light border border-accent/20 rounded-xl">
          <Shield className="w-4 h-4 text-accent flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-accent-muted">IISTA verification pending</p>
            <p className="text-2xs text-accent/70 mt-0.5">
              Invoice ID: {checkout.invoice_id}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
