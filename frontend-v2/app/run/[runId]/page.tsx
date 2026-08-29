"use client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/shell/NavBar";
import { CommerceWindow } from "@/components/run/CommerceWindow";
import { AgentTimeline } from "@/components/run/AgentTimeline";
import { IISTARail } from "@/components/run/IISTARail";
import { LiveEventFeed } from "@/components/run/LiveEventFeed";
import { ResultBanner } from "@/components/run/ResultBanner";
import { useLiveRun } from "@/hooks/useLiveRun";
import { cn } from "@/lib/cn";

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

  const handleReset = async () => {
    await reset();
    router.push("/");
  };

  // Derive agent action label for commerce window
  const agentAction = view.agentSteps.find((s) => s.status === "active")?.label ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <NavBar
        phase={phase}
        runId={runId}
        blocked={blocked}
        onReset={handleReset}
      />

      {/* Intent banner */}
      {view.prompt && (
        <div className="border-b border-border bg-paper px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xs font-semibold text-ink-faint uppercase tracking-wider whitespace-nowrap flex-shrink-0">
              Authorization request
            </span>
            <span className="text-sm text-ink truncate">{view.prompt}</span>
          </div>
          {view.policy?.budget_max != null && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xs text-ink-faint">Budget</span>
              <span className="text-sm font-bold text-ink">
                ${view.policy.budget_max}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger-light border-b border-blocked-border px-6 py-3 text-sm text-danger"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout — three columns */}
      <div className="flex-1 flex overflow-hidden">
        {/*
          Left panel: Agent timeline + event feed
          Center: Commerce window (the main visual story)
          Right: IISTA rail
        */}
        <div className="flex flex-1 gap-0 min-h-0">
          {/* LEFT — Agent timeline + event feed */}
          <aside className="w-64 xl:w-72 flex-shrink-0 border-r border-border flex flex-col bg-paper overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 scroll-thin space-y-6">
              <AgentTimeline steps={view.agentSteps} />

              <div className="border-t border-border" />

              <div>
                <p className="section-label">Live events</p>
                <LiveEventFeed events={view.events} maxItems={16} />
              </div>
            </div>
          </aside>

          {/* CENTER — Commerce window + result banner */}
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <div className="flex-1 p-5 space-y-4">
              {/* Result banner — appears on settle */}
              <AnimatePresence>
                {settled && (granted || blocked) && (
                  <ResultBanner
                    view={view}
                    onReset={handleReset}
                  />
                )}
              </AnimatePresence>

              {/* Commerce window — always present */}
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
          </main>

          {/* RIGHT — IISTA rail */}
          <aside className="w-72 xl:w-80 flex-shrink-0 border-l border-border bg-paper overflow-hidden">
            <div className="h-full p-4">
              <IISTARail view={view} phase={phase} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
