"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LiveConsole } from "@/components/run/LiveConsole";
import { ReportReadyHint } from "@/components/run/ReportReadyHint";
import { REPORT_SECTION_ID, RunReportViewport } from "@/components/run/RunReportViewport";
import { finalizeOrder } from "@/lib/api";
import { useLiveRun } from "@/hooks/useLiveRun";
import { usePacedNarrative } from "@/hooks/usePacedNarrative";

interface PageProps {
  params: { runId: string };
}

export default function RunPage({ params }: PageProps) {
  const { runId } = params;
  const router = useRouter();
  const { phase, view, store, error, reset, pollStore } = useLiveRun(runId);
  const narrative = usePacedNarrative(view, store, phase);
  const { isComplete } = narrative;
  const finalizedRef = useRef(false);

  useEffect(() => {
    finalizedRef.current = false;
  }, [runId]);

  useEffect(() => {
    if (
      finalizedRef.current ||
      phase !== "settled" ||
      view.authorized !== true ||
      !view.payment ||
      !isComplete
    ) {
      return;
    }
    finalizedRef.current = true;
    void finalizeOrder(runId)
      .then(() => pollStore(runId))
      .catch(() => {
        finalizedRef.current = false;
      });
  }, [phase, runId, view.authorized, view.payment, pollStore, isComplete]);

  const showReport =
    view.authorized === true &&
    isComplete &&
    (phase === "settled" || Boolean(view.payment?.order_id));

  const handleReset = async () => {
    await reset();
    router.push("/");
  };

  return (
    <div className="bg-[#0A0B0D] text-[#F4F5F7]">
      <LandingNav />

      <div className="pt-14">
        {error && (
          <div className="px-8 py-2 text-center font-mono text-[12px] text-[#EF4444]">
            {error}
          </div>
        )}

        <div className="mx-auto px-4 pb-6 pt-8 sm:px-10 sm:pt-10">
          <LiveConsole
            view={view}
            store={store}
            phase={phase}
            displayIndex={narrative.displayIndex}
            activeChapter={narrative.activeChapter}
            onReset={handleReset}
          />
        </div>

        <RunReportViewport
          view={view}
          store={store}
          runId={runId}
          visible={showReport}
        />

        <ReportReadyHint visible={showReport} reportSectionId={REPORT_SECTION_ID} />
      </div>
    </div>
  );
}
