"use client";

import { cn } from "@/lib/cn";
import { buildVerificationChecks, type ViewModel } from "@/lib/reduce";
import { LiveEventFeed } from "@/components/run/LiveEventFeed";
import type { Phase } from "@/lib/types";

interface EvidenceDrawerProps {
  view: ViewModel;
  phase: Phase;
  className?: string;
}

function TechRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/[0.04] py-3 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/30">
        {label}
      </span>
      <span
        className={cn(
          "text-[12px] text-white/55 break-all",
          mono && "font-mono text-[11px] text-[#10B981]/75",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function EvidenceDrawer({ view, phase, className }: EvidenceDrawerProps) {
  const checks = buildVerificationChecks(view, phase);
  const digest =
    view.ssi && typeof view.ssi.digest === "string" ? view.ssi.digest : null;
  const tip =
    view.nodes.length > 0
      ? view.nodes[view.nodes.length - 1].node_hash ||
        view.nodes[view.nodes.length - 1].hash ||
        ""
      : "";

  return (
    <details
      className={cn(
        "group rounded-2xl border border-white/[0.06] bg-white/[0.02]",
        className,
      )}
    >
      <summary className="cursor-pointer list-none px-5 py-4 text-[14px] font-medium text-white/70 transition-colors hover:text-white/90">
        Technical evidence — detailed report
        <span className="float-right font-mono text-[10px] font-normal uppercase tracking-wider text-white/30 group-open:hidden">
          Expand
        </span>
        <span className="float-right hidden font-mono text-[10px] font-normal uppercase tracking-wider text-white/30 group-open:inline">
          Collapse
        </span>
      </summary>

      <div className="space-y-6 border-t border-white/[0.06] px-5 py-5">
        {/* SSI / policy */}
        <section>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            Sealed intent (SSI)
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-[#0D0E12]/60 px-4 py-1">
            {digest ? (
              <TechRow label="Policy digest" value={`${digest.slice(0, 24)}…`} mono />
            ) : (
              <TechRow label="Policy digest" value="Pending" />
            )}
            {view.policy && (
              <>
                <TechRow
                  label="Budget ceiling"
                  value={`$${view.policy.budget_max ?? view.policy.budget ?? "—"}`}
                />
                <TechRow
                  label="Merchant scope"
                  value={String(view.policy.merchant_id ?? "approved-marketplace")}
                />
                <TechRow
                  label="Allowed tools"
                  value={String(view.policy.allowed_tools?.length ?? 5)}
                />
              </>
            )}
          </div>
        </section>

        {/* Execution graph */}
        <section>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            Execution graph
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-[#0D0E12]/60 px-4 py-1">
            <TechRow label="Attested nodes" value={String(view.nodes.length)} />
            {tip && <TechRow label="Chain tip" value={`${tip.slice(0, 20)}…`} mono />}
            {view.nodes.length > 0 && (
              <div className="py-3">
                <div className="flex flex-wrap gap-2">
                  {view.nodes.map((node, i) => (
                    <span
                      key={node.node_hash || node.hash || i}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-white/45"
                    >
                      {node.tool.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* DAE verification checklist */}
        <section>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            DAE verification
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-[#0D0E12]/60 px-4 py-1">
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-3 border-b border-white/[0.04] py-3 last:border-0"
              >
                <div
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    check.state === "ok" && "bg-[#10B981]",
                    check.state === "bad" && "bg-[#EF4444]",
                    check.state === "wait" && "bg-white/20",
                  )}
                />
                <div>
                  <p className="text-[13px] font-medium text-white/70">{check.label}</p>
                  <p className="mt-0.5 text-[12px] text-white/35">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Raw event stream */}
        <section>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
            Event stream
          </p>
          <LiveEventFeed events={view.events} maxItems={24} dark />
        </section>
      </div>
    </details>
  );
}
