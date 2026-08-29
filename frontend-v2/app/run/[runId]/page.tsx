"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LandingNav } from "@/components/landing/LandingNav";
import { CommerceWindow } from "@/components/run/CommerceWindow";
import { AgentTimeline } from "@/components/run/AgentTimeline";
import { IISTARail } from "@/components/run/IISTARail";
import { LiveEventFeed } from "@/components/run/LiveEventFeed";
import { ResultBanner } from "@/components/run/ResultBanner";
import { useLiveRun } from "@/hooks/useLiveRun";

interface PageProps {
  params: { runId: string };
}

export default function RunPage({ params }: PageProps) {
  const { runId } = params;
  const router = useRouter();
  const { phase, view, error, reset } = useLiveRun(runId);

  const blocked = view.authorized === false;
  const granted = view.authorized === true;
  const settled = phase === "settled";
  const agentAction = view.agentSteps.find((s) => s.status === "active")?.label ?? null;

  const handleReset = async () => {
    await reset();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <LandingNav />

      {view.prompt && (
        <div className="border-b border-border bg-[#FAFAF9] px-5 py-3 md:px-8">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Sealed intent
              </span>
              <span className="truncate text-[14px] font-medium text-ink">{view.prompt}</span>
            </div>
            {view.policy?.budget_max != null && (
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                  Limit
                </span>
                <span className="text-[14px] font-semibold text-ink">
                  ${view.policy.budget_max}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-[#FAFAF9] px-6 py-3 text-[14px] font-medium text-ink"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-[1100px] px-5 py-8 md:px-8 md:py-10">
        <motion.div
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Protected execution
            </p>
            <h1 className="mt-2 text-[28px] font-medium leading-[1.12] tracking-[-0.04em] text-ink sm:text-[32px]">
              The transaction, as it happens
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {phase === "live" && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
                Live
              </span>
            )}
            {settled && (
              <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                {blocked ? "Blocked" : granted ? "Settled" : "Complete"}
              </span>
            )}
            <button
              onClick={handleReset}
              className="rounded-full border border-border px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-ink"
            >
              New run
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 space-y-5">
            <AnimatePresence>
              {settled && (granted || blocked) && (
                <ResultBanner view={view} onReset={handleReset} />
              )}
            </AnimatePresence>

            <div className="overflow-hidden rounded-[20px] border border-border bg-paper shadow-sm">
              <CommerceWindow
                view={view.commerceView}
                selectedProductId={view.selectedProduct}
                cartItems={view.cartItems}
                checkout={view.checkout}
                invoice={view.invoice}
                order={view.order}
                blockReason={view.blockReason}
                authorizedBudget={view.policy?.budget_max ?? view.policy?.budget ?? null}
                agentAction={agentAction}
                className="h-[520px] xl:h-[580px]"
              />
            </div>

            <div className="rounded-[20px] border border-border bg-paper p-5">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Agent timeline
              </p>
              <AgentTimeline steps={view.agentSteps} />
            </div>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[20px] border border-border bg-paper p-5">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Authorization rail
              </p>
              <IISTARail view={view} phase={phase} />
            </div>

            <details className="group rounded-[20px] border border-border bg-paper p-5">
              <summary className="cursor-pointer list-none text-[14px] font-medium text-ink">
                Execution evidence
                <span className="float-right font-mono text-[10px] font-normal text-ink-faint group-open:hidden">
                  OPEN
                </span>
              </summary>
              <div className="mt-4 border-t border-border pt-3">
                <LiveEventFeed events={view.events} maxItems={16} />
              </div>
            </details>
          </aside>
        </div>
      </main>
    </div>
  );
}
