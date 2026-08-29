"use client";
import { motion } from "framer-motion";
import { CheckCircle, ShieldX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ViewModel } from "@/lib/reduce";

interface ResultBannerProps {
  view: ViewModel;
  onReset?: () => void;
  className?: string;
}

export function ResultBanner({ view, onReset, className }: ResultBannerProps) {
  const blocked = view.authorized === false;
  const granted = view.authorized === true;

  if (!granted && !blocked) return null;

  const budget = view.policy?.budget_max ?? view.policy?.budget;
  const amount =
    view.payment?.transaction?.amount ??
    (typeof view.payment?.amount === "number" ? view.payment.amount : null) ??
    view.checkout?.price ??
    view.invoice?.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-2xl border p-6 space-y-4",
        granted
          ? "bg-success-light border-authorized-border"
          : "bg-danger-light border-blocked-border",
        className,
      )}
    >
      {/* Icon + headline */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
              granted
                ? "bg-success/10 border border-authorized-border"
                : "bg-danger/10 border border-blocked-border",
            )}
          >
            {granted ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <ShieldX className="w-6 h-6 text-danger" />
            )}
          </div>

          <div>
            <h2 className={cn("text-xl font-bold", granted ? "text-success" : "text-danger")}>
              {granted ? "Transaction authorized" : "Transaction blocked"}
            </h2>
            <p className={cn("text-sm mt-1 leading-relaxed max-w-lg", granted ? "text-success/80" : "text-danger/80")}>
              {granted
                ? `The agent selected VPS Basic${amount != null ? ` · $${amount}` : ""}. The execution path matched the sealed policy. IISTA verified all checks and signed the transaction.`
                : view.blockReason ?? "IISTA refused to sign the transaction."}
            </p>
          </div>
        </div>

        {onReset && (
          <button onClick={onReset} className="btn-ghost flex-shrink-0 text-xs gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            New run
          </button>
        )}
      </div>

      {/* Stats row */}
      {blocked && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Agent attempted", value: view.selectedProduct ?? "—", danger: false },
            { label: "Invoice amount", value: amount != null ? `$${amount}` : "—", danger: true },
            { label: "Authorized limit", value: budget != null ? `$${budget}` : "—", danger: false },
            { label: "Payment", value: "$0", danger: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-paper/60 border border-blocked-border rounded-xl p-3 text-center"
            >
              <p className={cn("text-sm font-bold", stat.danger ? "text-danger" : "text-ink")}>
                {stat.value}
              </p>
              <p className="text-2xs text-danger/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
