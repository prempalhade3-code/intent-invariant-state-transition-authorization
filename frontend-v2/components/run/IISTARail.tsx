"use client";
import { cn } from "@/lib/cn";
import { PulseRing } from "@/components/primitives/PulseRing";
import { VerificationChecklist } from "@/components/run/VerificationChecklist";
import { ExecutionPath } from "@/components/run/ExecutionPath";
import { AuthorizationMoment } from "@/components/run/AuthorizationMoment";
import { buildVerificationChecks } from "@/lib/reduce";
import type { ViewModel } from "@/lib/reduce";
import type { Phase } from "@/lib/types";

interface IISTARailProps {
  view: ViewModel;
  phase: Phase;
  className?: string;
}

export function IISTARail({ view, phase, className }: IISTARailProps) {
  const blocked = view.authorized === false;
  const granted = view.authorized === true;
  const checks = buildVerificationChecks(view, phase);
  const budget = view.policy?.budget_max ?? view.policy?.budget ?? null;

  return (
    <div className={cn("flex flex-col gap-5 h-full overflow-y-auto scroll-thin", className)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-ink">SWORN enclave</span>
            {phase === "live" && !blocked && !granted && (
              <PulseRing active size="sm" variant="accent" />
            )}
          </div>
          <p className="text-xs text-ink-faint mt-0.5">Independent authorization layer</p>
        </div>
      </div>

      {/* Policy summary */}
      {view.policy && (
        <div className="flex-shrink-0 p-3 bg-surface border border-border rounded-xl space-y-1.5">
          <p className="text-2xs font-semibold text-ink-faint uppercase tracking-wider">Sealed policy</p>
          {budget != null && (
            <div className="flex justify-between text-xs">
              <span className="text-ink-faint">Budget ceiling</span>
              <span className="font-semibold text-ink">${budget}</span>
            </div>
          )}
          {view.policy.allowed_domains?.[0] && (
            <div className="flex justify-between text-xs">
              <span className="text-ink-faint">Approved domain</span>
              <span className="font-mono text-xs text-ink truncate max-w-[120px]">
                {view.policy.allowed_domains[0]}
              </span>
            </div>
          )}
          {view.policy.allowed_tools?.length && (
            <div className="flex justify-between text-xs">
              <span className="text-ink-faint">Tools allowed</span>
              <span className="font-semibold text-ink">{view.policy.allowed_tools.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Execution path */}
      <div className="flex-shrink-0">
        <ExecutionPath
          nodes={view.nodes}
          blocked={blocked}
        />
      </div>

      {/* Verification checklist */}
      <div className="flex-shrink-0">
        <p className="section-label">Verification checks</p>
        <VerificationChecklist checks={checks} />
      </div>

      {/* Authorization moment */}
      <div className="flex-shrink-0">
        <AuthorizationMoment
          authorized={view.authorized}
          blockReason={view.blockReason}
          payment={view.payment}
          budget={budget}
        />
      </div>

      {/* Settlement */}
      {view.payment && granted && (
        <div className="flex-shrink-0 p-3 bg-success-light border border-authorized-border rounded-xl">
          <p className="text-2xs font-semibold text-success uppercase tracking-wider mb-1">Settlement</p>
          <p className="text-xs text-success">
            Paid · simulated payment ledger
          </p>
        </div>
      )}
    </div>
  );
}
