"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldX } from "lucide-react";
import { cn } from "@/lib/cn";
import { HighlightPulse } from "./HighlightPulse";
import { IncidentLedger } from "./IncidentLedger";
import { buildVerificationChecks } from "@/lib/reduce";
import type { ViewModel } from "@/lib/reduce";
import type { IncidentDef } from "@/lib/incidents";
import type { IncidentPhase } from "@/hooks/useIncidentRun";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type PlayerBeat = "idle" | "intent" | "agent" | "verify" | "verdict";

interface IncidentPlayerProps {
  incident: IncidentDef;
  phase: IncidentPhase;
  view: ViewModel;
  onReplay: () => void;
}

const reveal = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

function panelClass(extra?: string) {
  return cn(
    "flex shrink-0 flex-col rounded-xl border border-white/[0.08] px-3 py-3 sm:min-h-0 sm:flex-1 sm:px-5 sm:py-5",
    extra,
  );
}

export function IncidentPlayer({
  incident,
  phase,
  view,
  onReplay,
}: IncidentPlayerProps) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [beat, setBeat] = useState<PlayerBeat>("idle");
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [tellVisible, setTellVisible] = useState(false);

  const running = phase === "running";
  const settled = phase === "settled" || phase === "error";
  const budget = view.policy?.budget_max ?? view.policy?.budget ?? 25;
  const amount =
    view.checkout?.price ??
    view.invoice?.price ??
    (incident.id === "prompt-injection" ? 200 : incident.id === "toctou" ? 50 : 20);

  const steps = incident.agentSteps;
  const stepsDone = visibleSteps >= steps.length;
  const hasTellVisible = steps.slice(0, visibleSteps).some((s) => s.isTell);

  const checks = buildVerificationChecks(
    settled ? view : { ...view, authorized: null },
    settled ? "settled" : running ? "live" : "idle",
  )
    .filter((c) => ["intent", "path", "verification", "auth"].includes(c.id))
    .map((c) => {
      if (!settled && (beat === "verify" || beat === "verdict")) {
        if (c.id === incident.failingCheckId) {
          return {
            ...c,
            state: "bad" as const,
            detail: view.blockReason ?? incident.verdictLine,
          };
        }
        if (c.state === "wait" && c.id !== incident.failingCheckId) {
          return { ...c, state: "ok" as const };
        }
      }
      return c;
    });

  useEffect(() => {
    if (phase === "idle") {
      setBeat("idle");
      setVisibleSteps(0);
      setTellVisible(false);
      return;
    }
    if (phase === "running" && beat === "idle") {
      setBeat("intent");
      setVisibleSteps(0);
      setTellVisible(false);
    }
  }, [phase, beat]);

  useEffect(() => {
    if (hasTellVisible) setTellVisible(true);
  }, [hasTellVisible]);

  useEffect(() => {
    if (beat === "idle") return;

    if (beat === "intent") {
      const t = setTimeout(() => setBeat("agent"), 800);
      return () => clearTimeout(t);
    }

    if (beat === "agent" && !stepsDone) {
      const t = setTimeout(() => setVisibleSteps((s) => s + 1), 520);
      return () => clearTimeout(t);
    }

    if (beat === "agent" && stepsDone) {
      const t = setTimeout(() => setBeat("verify"), 500);
      return () => clearTimeout(t);
    }

    if (beat === "verify" && settled) {
      const t = setTimeout(() => setBeat("verdict"), 600);
      return () => clearTimeout(t);
    }
  }, [beat, stepsDone, settled]);

  const showIntent = beat !== "idle";
  const showAgent = beat === "agent" || beat === "verify" || beat === "verdict";
  const showVerify = beat === "verify" || beat === "verdict";
  const showVerdict = beat === "verdict" && settled;

  return (
    <div className="flex flex-col gap-3 overflow-x-hidden pb-2 sm:h-full sm:min-h-0 sm:flex-1 sm:gap-3 sm:overflow-hidden sm:pb-0">
      {(running || settled) && (
        <>
          <AnimatePresence mode={isMobile ? "sync" : "popLayout"}>
            {showIntent && (
              <motion.div
                layout={!isMobile}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reveal}
                className={panelClass("bg-[#161820]")}
              >
                <p className="mb-3 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                  Sealed policy
                </p>
                <div className="flex flex-col gap-3 sm:min-h-0 sm:flex-1 sm:gap-4">
                  <HighlightPulse variant="green" className="w-full shrink-0">
                    <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 px-3 py-3 sm:px-4">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-[#10B981]">
                        Protected invariant
                      </p>
                      <p className="mt-1 text-[16px] font-medium leading-snug text-[#F4F5F7] sm:text-[17px]">
                        {incident.policyHighlight}
                      </p>
                    </div>
                  </HighlightPulse>

                  <p className="shrink-0 text-[12px] leading-relaxed text-white/45 sm:text-[13px]">
                    {incident.policyNote}
                  </p>

                  <div className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-3 border-t border-white/[0.06] pt-3 sm:gap-x-4 sm:pt-4">
                    {incident.policyFields.map((field) => (
                      <div key={field.label}>
                        <p className="font-mono text-[9px] uppercase tracking-wide text-white/30">
                          {field.label}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-[13px]",
                            field.highlight ? "font-medium text-[#10B981]" : "text-white/60",
                          )}
                        >
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode={isMobile ? "sync" : "popLayout"}>
            {showAgent && (
              <motion.div
                layout={!isMobile}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reveal}
                className={panelClass("bg-[#0A0B0D]")}
              >
                <p className="mb-2 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                  Agent path
                </p>
                <p className="mb-3 shrink-0 text-[12px] leading-relaxed text-white/40 sm:text-[13px]">
                  {incident.agentIntro}
                </p>

                <div className="flex flex-col gap-2 sm:min-h-0 sm:flex-1">
                  <AnimatePresence initial={false}>
                    {steps.slice(0, visibleSteps).map((step, i) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: i * 0.03 }}
                        className="shrink-0"
                      >
                        {step.isTell ? (
                          <HighlightPulse variant="red" className="w-full shrink-0">
                            <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/5 px-3 py-3">
                              <span className="mt-0.5 font-mono text-[10px] text-red-400">×</span>
                              <div>
                                <p className="text-[14px] font-medium text-red-400">{step.label}</p>
                                {step.detail && (
                                  <p className="mt-1 text-[12px] leading-relaxed text-red-400/70">{step.detail}</p>
                                )}
                                {step.subdetail && (
                                  <p className="mt-1 text-[11px] leading-relaxed text-white/35">{step.subdetail}</p>
                                )}
                              </div>
                            </div>
                          </HighlightPulse>
                        ) : (
                          <div className="flex items-start gap-3 rounded-lg px-2 py-2 sm:px-3 sm:py-2.5">
                            <span className="mt-0.5 font-mono text-[10px] text-[#10B981]">✓</span>
                            <div>
                              <p className="text-[14px] font-medium text-[#F4F5F7]">{step.label}</p>
                              {step.detail && (
                                <p className="mt-0.5 text-[12px] leading-relaxed text-white/40">{step.detail}</p>
                              )}
                              {step.subdetail && (
                                <p className="mt-0.5 text-[11px] leading-relaxed text-white/30">{step.subdetail}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {tellVisible && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 shrink-0 border-t border-white/[0.06] pt-3 text-[12px] leading-relaxed text-white/45"
                    >
                      <span className="font-medium text-red-400">Critical moment: </span>
                      {incident.highlightLabel}
                    </motion.p>
                  )}

                  {running && !stepsDone && (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-40" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
                      </span>
                      <span className="text-[13px] text-white/35">Agent running</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode={isMobile ? "sync" : "popLayout"}>
            {showVerify && (
              <motion.div
                layout={!isMobile}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reveal}
                className={panelClass("bg-[#161820]")}
              >
                <IncidentLedger
                  checks={checks}
                  highlightId={incident.failingCheckId}
                  spread={!isMobile}
                  animated
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode={isMobile ? "sync" : "popLayout"}>
            {showVerdict && (
              <motion.div
                layout={!isMobile}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reveal}
                className={panelClass("border-red-500/20 bg-red-500/5")}
              >
                <div className="flex flex-col gap-4 sm:h-full sm:min-h-0 sm:flex-1 sm:justify-between">
                  <div>
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-500/25 bg-[#12141a]">
                        <ShieldX className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-[17px] font-medium text-red-400">Transaction blocked</p>
                        <p className="mt-1 text-[14px] leading-relaxed text-white/50">
                          {view.blockReason ?? incident.verdictLine}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                          Sworn withheld signing authority. No funds left the enclave.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3 sm:gap-3">
                      {[
                        { label: "Attempted", value: `$${amount}`, highlight: false },
                        { label: "Sealed limit", value: `$${budget}`, highlight: false },
                        { label: "Settled", value: "$0", highlight: true },
                      ].map((stat) => (
                        <div key={stat.label}>
                          {stat.highlight ? (
                            <HighlightPulse variant="green" rounded="lg">
                              <div className="rounded-lg border border-[#10B981]/20 bg-[#10B981]/5 px-3 py-4 text-center">
                                <p className="text-[18px] font-medium text-[#10B981]">{stat.value}</p>
                                <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-white/35">
                                  {stat.label}
                                </p>
                              </div>
                            </HighlightPulse>
                          ) : (
                            <div className="rounded-lg border border-white/[0.08] bg-[#12141a] px-3 py-4 text-center">
                              <p className="text-[17px] font-medium text-[#F4F5F7]">{stat.value}</p>
                              <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-white/35">
                                {stat.label}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-end sm:justify-between">
                    <p className="text-[12px] leading-relaxed text-white/45 sm:text-[13px]">{incident.proves}</p>
                    <button
                      type="button"
                      onClick={onReplay}
                      className="shrink-0 rounded-full bg-[#10B981] px-4 py-2 text-[13px] font-medium text-[#0A0B0D] transition-all hover:bg-[#0ea472] active:scale-[0.97]"
                    >
                      Replay
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
