"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChapterId } from "@/lib/narrative";
import {
  buildHumanChecks,
  humanBlockReason,
  isSwornChapter,
  productLabel,
  transactionAmount,
} from "@/lib/narrative";
import type { ViewModel } from "@/lib/reduce";
import type { Phase, StoreSnapshot } from "@/lib/types";
import { AuthorizationSeal } from "@/components/run/AuthorizationSeal";

function SealedCard({ view }: { view: ViewModel }) {
  const budget = view.policy?.budget_max ?? view.policy?.budget ?? 25;
  const merchant = view.policy?.merchant_id ?? "Northbridge Cloud";
  const tools = view.policy?.allowed_tools?.length ?? 5;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/10">
          <Shield className="h-4 w-4 text-[#10B981]" />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            Sealed authorization
          </p>
          <p className="text-[13px] font-medium text-white/75">Locked before the agent acted</p>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-relaxed text-white/55">
        You authorized: buy one basic VPS · up to{" "}
        <span className="text-white/80">${budget}</span> · from{" "}
        <span className="text-white/80">{merchant}</span> only.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { label: "Budget ceiling", value: `$${budget}` },
          { label: "Approved merchant", value: merchant },
          { label: "Allowed actions", value: `${tools} tools` },
        ].map((chip) => (
          <span
            key={chip.label}
            className="rounded-full border border-white/[0.08] bg-[#0A0B0D] px-3 py-1"
          >
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">
              {chip.label}
            </span>
            <span className="ml-1.5 text-[11px] text-white/60">{chip.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function AuthorizeSeal({
  product,
  amount,
}: {
  product: string;
  amount: number | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/[0.06] p-5"
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#10B981] bg-[#10B981]/10"
        >
          <Shield className="h-5 w-5 text-[#10B981]" />
        </motion.div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#10B981]">
            SWORN authorized
          </p>
          <p className="text-[14px] font-medium text-white/80">Payment released</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-white/50">
        {amount != null
          ? `SWORN verified ${product} for $${amount} matched your authorization, then released payment.`
          : `SWORN verified the purchase matched your authorization, then released payment.`}
      </p>
    </motion.div>
  );
}

interface SwornRailProps {
  view: ViewModel;
  store: StoreSnapshot;
  phase: Phase;
  activeChapter: ChapterId;
  revealedChecks: number;
  onNewRun?: () => void;
  className?: string;
}

export function SwornRail({
  view,
  store,
  phase,
  activeChapter,
  revealedChecks,
  onNewRun,
  className,
}: SwornRailProps) {
  const product = productLabel(view, store);
  const amount = transactionAmount(view, store);
  const blocked = view.authorized === false;
  const swornActive = isSwornChapter(activeChapter);
  const showVerify =
    activeChapter === "verify" ||
    (blocked && view.verification != null) ||
    activeChapter === "authorize" ||
    activeChapter === "pay" ||
    activeChapter === "result";
  const showSeal =
    activeChapter === "authorize" ||
    activeChapter === "pay" ||
    activeChapter === "result";
  const showBlocked = blocked && view.verification != null;
  const showResult = activeChapter === "result" && !blocked;

  const checks = buildHumanChecks(view, store, revealedChecks);
  const sealState = showBlocked
    ? "blocked"
    : view.authorized === true
      ? "authorized"
      : revealedChecks > 0
        ? "checking"
        : "waiting";

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-auto p-5 sm:p-6 lg:p-8",
        swornActive && "bg-[#0D0E12]/60",
        className,
      )}
    >
      <motion.div
        animate={swornActive ? { scale: 1, opacity: 1 } : { scale: 0.98, opacity: 0.85 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-5"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            SWORN
          </p>
          <p className="mt-0.5 text-[13px] text-white/50">Authorization boundary</p>
        </div>

        <SealedCard view={view} />

        <AnimatePresence mode="wait">
          {showVerify && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              {showBlocked ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#EF4444]/25 bg-[#EF4444]/[0.06] p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#EF4444]">
                      Payment blocked
                    </p>
                    <p className="mt-2 text-[15px] font-medium text-[#EF4444]">
                      No money was moved
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/45">
                      {humanBlockReason(view.blockReason)}
                    </p>
                  </div>
                  <AuthorizationSeal
                    checks={buildHumanChecks(view, store, 4)}
                    state="blocked"
                    blockReason={humanBlockReason(view.blockReason)}
                  />
                </div>
              ) : (
                <>
                  <p className="mb-3 text-[13px] text-white/45">
                    Checking the proposed transaction against what you authorized:
                  </p>
                  <AuthorizationSeal checks={checks} state={sealState} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSeal && !showBlocked && (
            <motion.div
              key="seal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AuthorizeSeal product={product} amount={amount} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border-t border-white/[0.06] pt-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#10B981]">
                Purchase complete
              </p>
              <p className="text-[14px] leading-relaxed text-white/60">
                Your agent bought {product}
                {amount != null && ` for $${amount}`}. SWORN verified it against your
                authorization before releasing payment.
              </p>
              <div className="flex flex-wrap gap-2">
                {store.order?.order_id && (
                  <a
                    href={`/store/order/${store.order.order_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-2 text-[12px] font-medium text-[#10B981] hover:bg-[#10B981]/20"
                  >
                    View order in store
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {onNewRun && (
                  <button
                    onClick={onNewRun}
                    className="rounded-full border border-white/[0.12] px-4 py-2 text-[12px] font-medium text-white/55 hover:text-white"
                  >
                    New run
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
