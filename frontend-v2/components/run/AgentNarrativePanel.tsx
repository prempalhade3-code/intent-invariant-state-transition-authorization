"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChapterId } from "@/lib/narrative";
import {
  CHAPTER_SEQUENCE,
  chapterCopy,
  buildHumanChecks,
  humanBlockReason,
  isSwornFocusChapter,
} from "@/lib/narrative";
import type { ViewModel } from "@/lib/reduce";
import type { StoreSnapshot } from "@/lib/types";
import { AuthorizationSeal } from "@/components/run/AuthorizationSeal";

interface AgentNarrativePanelProps {
  view: ViewModel;
  store: StoreSnapshot;
  activeChapter: ChapterId;
  displayIndex: number;
  revealedChecks: number;
  onNewRun?: () => void;
}

function DoneStep({ summary }: { summary: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 py-2"
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15">
        <Check className="h-3 w-3 text-[#10B981]" />
      </div>
      <p className="text-[14px] text-white/35">{summary}</p>
    </motion.div>
  );
}

function SealedSummary({ view }: { view: ViewModel }) {
  const budget = view.policy?.budget_max ?? view.policy?.budget ?? 25;
  const merchant = view.policy?.merchant_id ?? "Northbridge Cloud";
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {[
        { label: "Budget ceiling", value: `$${budget}` },
        { label: "Approved merchant", value: merchant },
        { label: "Allowed actions", value: `${view.policy?.allowed_tools?.length ?? 5} tools` },
      ].map((chip) => (
        <span
          key={chip.label}
          className="rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2"
        >
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">
            {chip.label}
          </span>
          <span className="ml-2 text-[13px] text-white/60">{chip.value}</span>
        </span>
      ))}
    </div>
  );
}

export function AgentNarrativePanel({
  view,
  store,
  activeChapter,
  displayIndex,
  revealedChecks,
  onNewRun,
}: AgentNarrativePanelProps) {
  const copy = chapterCopy(activeChapter, view, store);
  const blocked = view.authorized === false;
  const swornFocus = isSwornFocusChapter(activeChapter);

  const doneChapters = CHAPTER_SEQUENCE.slice(0, displayIndex);
  const checks = buildHumanChecks(view, store, revealedChecks);
  const sealState = blocked
    ? "blocked"
    : view.authorized === true
      ? "authorized"
      : revealedChecks > 0
        ? "checking"
        : "waiting";

  return (
    <div className="space-y-6 py-4 lg:py-8">
      {/* Completed steps */}
      {doneChapters.length > 0 && (
        <div className="space-y-0.5 border-b border-white/[0.04] pb-6">
          {doneChapters.map((ch) => {
            const c = chapterCopy(ch.id, view, store);
            return c.summary ? <DoneStep key={ch.id} summary={c.summary} /> : null;
          })}
        </div>
      )}

      {/* Active beat — hero */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChapter}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">
            {swornFocus ? "SWORN" : "Agent"}
          </p>

          <h2
            className={cn(
              "text-[clamp(28px,4vw,44px)] font-medium leading-[1.1] tracking-[-0.03em]",
              activeChapter === "result" && !blocked && "text-[#10B981]",
              blocked && activeChapter === "verify" && "text-[#EF4444]",
              !blocked && activeChapter !== "result" && "text-[#F4F5F7]",
            )}
          >
            {copy.headline}
          </h2>

          {copy.sub && (
            <p className="max-w-xl text-[16px] leading-relaxed text-white/50 sm:text-[17px]">
              {copy.sub}
            </p>
          )}

          {(activeChapter === "intent" || activeChapter === "fathom") && (
            <SealedSummary view={view} />
          )}

          {/* SWORN verification — only during sworn focus, left takes full attention */}
          {swornFocus && activeChapter === "verify" && (
            <div className="mt-8 max-w-lg space-y-5">
              {blocked && view.verification != null ? (
                <>
                  <p className="text-[15px] text-[#EF4444]/90">
                    {humanBlockReason(view.blockReason)}
                  </p>
                  <AuthorizationSeal
                    checks={buildHumanChecks(view, store, 4)}
                    state="blocked"
                    blockReason={humanBlockReason(view.blockReason)}
                  />
                </>
              ) : (
                <>
                  <p className="text-[14px] text-white/45">
                    Checking the proposed transaction against what you authorized:
                  </p>
                  <AuthorizationSeal checks={checks} state={sealState} />
                </>
              )}
            </div>
          )}

          {swornFocus && activeChapter === "authorize" && !blocked && (
            <div className="mt-6 max-w-lg rounded-xl border border-[#10B981]/30 bg-[#10B981]/[0.06] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#10B981]">
                SWORN authorized
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                Verification passed. SWORN matched what the agent did against your sealed
                authorization, then released payment.
              </p>
            </div>
          )}

          {activeChapter === "result" && !blocked && (
            <div className="mt-8 flex flex-wrap gap-3">
              {store.order?.order_id && (
                <a
                  href={`/store/order/${store.order.order_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-5 py-2.5 text-[13px] font-medium text-[#10B981] hover:bg-[#10B981]/20"
                >
                  View order in store
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {onNewRun && (
                <button
                  onClick={onNewRun}
                  className="rounded-full border border-white/[0.12] px-5 py-2.5 text-[13px] font-medium text-white/55 hover:text-white"
                >
                  New run
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
