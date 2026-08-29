"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Loader2, Circle,
  FileText, ShoppingCart, Search, Eye, CreditCard, Shield, Banknote, Brain,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AgentStep } from "@/lib/types";

interface AgentTimelineProps {
  steps: AgentStep[];
  className?: string;
}

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  intent: Brain,
  plan: FileText,
  search: Search,
  product: Eye,
  cart: ShoppingCart,
  checkout: CreditCard,
  invoice: FileText,
  auth: Shield,
  payment: Banknote,
};

function StepIcon({ stepId, status }: { stepId: string; status: AgentStep["status"] }) {
  const Icon = STEP_ICONS[stepId] ?? Circle;

  if (status === "done") {
    return (
      <div className="w-7 h-7 rounded-full bg-success-light border border-authorized-border flex items-center justify-center flex-shrink-0">
        <Check className="w-3.5 h-3.5 text-success" />
      </div>
    );
  }
  if (status === "blocked") {
    return (
      <div className="w-7 h-7 rounded-full bg-danger-light border border-blocked-border flex items-center justify-center flex-shrink-0">
        <X className="w-3.5 h-3.5 text-danger" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="w-7 h-7 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center flex-shrink-0">
        <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
      </div>
    );
  }
  // pending
  return (
    <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-ink-faint" />
    </div>
  );
}

function ConnectorLine({ status }: { status: AgentStep["status"] }) {
  return (
    <div className="w-px h-4 flex-shrink-0 ml-3.5">
      <div
        className={cn(
          "w-full h-full transition-colors duration-300",
          status === "done" ? "bg-success/30" :
          status === "blocked" ? "bg-danger/30" :
          status === "active" ? "bg-accent/30" :
          "bg-border",
        )}
      />
    </div>
  );
}

export function AgentTimeline({ steps, className }: AgentTimelineProps) {
  // Only show steps that are not pending unless they're next after done
  const doneCount = steps.filter((s) => s.status === "done" || s.status === "blocked").length;
  const visible = steps.filter((s, i) => {
    if (s.status !== "pending") return true;
    return i <= doneCount + 1; // show at most 2 ahead
  });

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="section-label">Agent progress</p>
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {visible.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Step row */}
              <div
                className={cn(
                  "flex items-start gap-3 py-1",
                  step.status === "pending" && "opacity-40",
                )}
              >
                <StepIcon stepId={step.id} status={step.status} />
                <div className="flex-1 min-w-0 pt-1">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      step.status === "done" ? "text-ink" :
                      step.status === "active" ? "text-accent" :
                      step.status === "blocked" ? "text-danger" :
                      "text-ink-faint",
                    )}
                  >
                    {step.label}
                  </p>
                  {step.detail && step.status !== "pending" && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-ink-faint mt-0.5 truncate"
                    >
                      {step.detail}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Connector (not after last) */}
              {i < visible.length - 1 && (
                <ConnectorLine status={step.status} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
