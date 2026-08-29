"use client";
import { motion } from "framer-motion";
import { FileText, Building2, Globe, Package, Hash } from "lucide-react";
import { cn } from "@/lib/cn";
import { HashChip } from "@/components/primitives/HashChip";
import type { InvoiceData } from "@/lib/types";

interface InvoiceViewProps {
  invoice: InvoiceData | null;
  className?: string;
}

export function InvoiceView({ invoice, className }: InvoiceViewProps) {
  if (!invoice) {
    return (
      <div className={cn("flex flex-col items-center gap-2 py-6 text-center", className)}>
        <FileText className="w-6 h-6 text-ink-faint" />
        <p className="text-sm text-ink-faint">Reading invoice…</p>
      </div>
    );
  }

  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      className={cn("space-y-3", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Invoice document */}
      <div className="bg-paper border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-ink">Invoice</span>
          </div>
          <span className="text-xs text-ink-faint">{date}</span>
        </div>

        {/* Invoice ID */}
        <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-ink-faint" />
            <span className="text-xs text-ink-faint">Invoice ID</span>
          </div>
          <HashChip value={invoice.invoice_id} full className="text-xs" />
        </div>

        {/* Line items */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{invoice.product_id}</p>
              <p className="text-xs text-ink-faint">1× monthly</p>
            </div>
            <p className="text-sm font-bold text-ink">${invoice.price}</p>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm font-semibold text-ink">Amount due</span>
            <span className="text-2xl font-bold text-ink">${invoice.price}</span>
          </div>
        </div>

        {/* Merchant */}
        <div className="px-4 py-3 border-t border-border bg-surface grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-ink-faint" />
            <span className="text-xs text-ink-faint truncate">{invoice.merchant_id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-ink-faint" />
            <span className="text-xs text-ink-faint truncate">{invoice.domain}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-ink-faint">
        IISTA is verifying this invoice against the sealed policy
      </p>
    </motion.div>
  );
}
