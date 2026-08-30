"use client";

import { motion } from "framer-motion";
import { CheckCircle, ShieldX, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ViewModel } from "@/lib/reduce";

interface RunResultBandProps {
  view: ViewModel;
  runId: string;
  storeOrder?: ViewModel["order"];
  className?: string;
}

export function RunResultBand({ view, runId, storeOrder, className }: RunResultBandProps) {
  const granted = view.authorized === true;
  const blocked = view.authorized === false;
  if (!granted && !blocked) return null;

  const order = storeOrder ?? view.order;

  const amount =
    view.payment?.transaction?.amount ??
    (typeof view.payment?.amount === "number" ? view.payment.amount : null) ??
    order?.amount ??
    order?.price ??
    view.checkout?.price ??
    view.invoice?.price;

  const q = `?run=${encodeURIComponent(runId)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl border px-6 py-6 sm:px-8 sm:py-7",
        granted
          ? "border-[#10B981]/30 bg-[#10B981]/[0.08]"
          : "border-[#EF4444]/30 bg-[#EF4444]/[0.06]",
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              granted ? "bg-[#10B981]/15" : "bg-[#EF4444]/15",
            )}
          >
            {granted ? (
              <CheckCircle className="h-6 w-6 text-[#10B981]" />
            ) : (
              <ShieldX className="h-6 w-6 text-[#EF4444]" />
            )}
          </div>
          <div>
            <h2
              className={cn(
                "text-[22px] font-medium tracking-[-0.02em]",
                granted ? "text-[#10B981]" : "text-[#EF4444]",
              )}
            >
              {granted ? "Transaction authorized" : "Transaction blocked"}
            </h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/55">
              {granted
                ? `SWORN verified the execution path and signed payment${amount != null ? ` for $${amount}` : ""}. The order is live in the store.`
                : view.blockReason ?? "SWORN refused to authorize this transaction."}
            </p>
          </div>
        </div>

        {granted && order?.order_id && (
          <a
            href={`/store/order/${order.order_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2.5 text-[13px] font-medium text-[#10B981] transition-colors hover:bg-[#10B981]/20"
          >
            View order in store
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {granted && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Product", value: view.selectedProduct ?? "—" },
            { label: "Amount", value: amount != null ? `$${amount}` : "—" },
            { label: "Transaction", value: order?.transaction_id ?? view.payment?.transaction_id ?? "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-[#0A0B0D]/40 px-4 py-3"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
                {stat.label}
              </p>
              <p className="mt-1 truncate text-[14px] font-medium text-white/75">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {blocked && (
        <div className="mt-6">
          <a
            href="/store/orders"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] text-white/45 transition-colors hover:text-white/70"
          >
            Check store — no order should exist
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
