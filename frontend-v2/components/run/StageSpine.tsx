"use client";

import { cn } from "@/lib/cn";
import type { TransactionStage } from "@/lib/types";

const AGENT_STAGES: { id: TransactionStage; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "inspect", label: "Inspect" },
  { id: "cart", label: "Cart" },
  { id: "checkout", label: "Checkout" },
];

const SWORN_STAGES: { id: TransactionStage; label: string }[] = [
  { id: "verify", label: "Verify" },
  { id: "authorize", label: "Authorize" },
  { id: "pay", label: "Pay" },
];

const STAGE_ORDER: TransactionStage[] = [
  "sealed",
  "search",
  "inspect",
  "cart",
  "checkout",
  "verify",
  "authorize",
  "pay",
  "complete",
  "blocked",
];

function stageIndex(stage: TransactionStage): number {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx === -1 ? 0 : idx;
}

function dotState(
  id: TransactionStage,
  current: TransactionStage,
): "done" | "active" | "pending" | "blocked" {
  if (current === "blocked") {
    if (id === "verify" || id === "authorize" || id === "pay") return "blocked";
    if (stageIndex(id) < stageIndex("verify")) return "done";
    return "pending";
  }
  if (current === "complete") return "done";
  const cur = stageIndex(current);
  const idx = stageIndex(id);
  if (idx < cur) return "done";
  if (idx === cur) return "active";
  return "pending";
}

function StageDot({
  label,
  state,
}: {
  label: string;
  state: "done" | "active" | "pending" | "blocked";
}) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[52px]">
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full transition-all duration-500",
          state === "done" && "bg-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.45)]",
          state === "active" && "bg-[#10B981] shadow-[0_0_16px_rgba(16,185,129,0.6)] scale-125",
          state === "pending" && "bg-white/15",
          state === "blocked" && "bg-[#EF4444]",
        )}
      />
      <span
        className={cn(
          "font-mono text-[9px] uppercase tracking-[0.12em] text-center leading-tight",
          state === "active" && "text-[#10B981]",
          state === "done" && "text-white/50",
          state === "pending" && "text-white/25",
          state === "blocked" && "text-[#EF4444]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function StageGroup({
  title,
  stages,
  current,
}: {
  title: string;
  stages: { id: TransactionStage; label: string }[];
  current: TransactionStage;
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
        {title}
      </p>
      <div className="flex items-start justify-between gap-1">
        {stages.map((s) => (
          <StageDot key={s.id} label={s.label} state={dotState(s.id, current)} />
        ))}
      </div>
    </div>
  );
}

interface StageSpineProps {
  stage: TransactionStage;
  className?: string;
}

export function StageSpine({ stage, className }: StageSpineProps) {
  const displayStage = stage === "sealed" ? "search" : stage === "complete" ? "pay" : stage;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5",
        className,
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <StageGroup title="Agent" stages={AGENT_STAGES} current={displayStage} />
        <div className="hidden sm:block w-px self-stretch bg-white/[0.06]" aria-hidden />
        <StageGroup title="Sworn" stages={SWORN_STAGES} current={displayStage} />
      </div>
    </div>
  );
}
