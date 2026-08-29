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

      {/* The sealed request remains visible, the technical proof stays secondary. */}
      {view.prompt && (
        <div className="border-b border-border bg-paper px-5 py-3 md:px-8">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] font-mono font-medium text-ink-faint uppercase tracking-[.14em] whitespace-nowrap flex-shrink-0">
              Sealed intent
            </span>
            <span className="text-sm font-medium text-ink truncate">{view.prompt}</span>
          </div>
          {view.policy?.budget_max != null && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-[.1em] text-ink-faint">Limit</span>
              <span className="text-sm font-bold text-ink">
                ${view.policy.budget_max}
              </span>
            </div>
          )}
          </div></div>
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

      <main className="flex-1 px-5 py-8 md:px-8">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-[10px] font-mono uppercase tracking-[.14em] text-ink-faint">Protected execution</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] text-ink">The transaction, as it happens.</h1></div>
            <p className="max-w-sm text-sm leading-relaxed text-ink-muted">The agent can act through the marketplace. SWORN stays outside that loop and decides what is allowed to settle.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
            <section className="min-w-0 space-y-5">
              <AnimatePresence>
                {settled && (granted || blocked) && (
                  <ResultBanner
                    view={view}
                    onReset={handleReset}
                  />
                )}
              </AnimatePresence>

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
                className="h-[560px] xl:h-[620px]"
              />
              <div className="rounded-[18px] border border-border bg-paper p-5"><AgentTimeline steps={view.agentSteps} /></div>
            </section>
            <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-[18px] border border-border bg-paper p-5"><IISTARail view={view} phase={phase} /></div>
              <details className="group rounded-[18px] border border-border bg-paper p-5">
                <summary className="cursor-pointer list-none text-sm font-medium text-ink">Execution evidence <span className="float-right font-mono text-[10px] text-ink-faint group-open:hidden">OPEN</span></summary>
                <div className="mt-4 border-t border-border pt-3"><LiveEventFeed events={view.events} maxItems={16} /></div>
              </details>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
