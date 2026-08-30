"use client";

import type { ViewModel } from "@/lib/reduce";
import type { Phase, StoreSnapshot } from "@/lib/types";
import type { ChapterId } from "@/lib/narrative";
import { LiveTaskBar } from "@/components/run/LiveTaskBar";
import { TERMINAL_W, TransactionWindow } from "@/components/run/TransactionWindow";

interface LiveConsoleProps {
  view: ViewModel;
  store: StoreSnapshot;
  phase: Phase;
  displayIndex: number;
  activeChapter: ChapterId;
  onReset?: () => void;
}

export function LiveConsole({
  view,
  store,
  phase,
  displayIndex,
  activeChapter,
  onReset,
}: LiveConsoleProps) {
  const live = phase === "live" || phase === "submitting";

  return (
    <section
      className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full flex-col"
      style={{ maxWidth: TERMINAL_W, width: "100%" }}
    >
      <LiveTaskBar prompt={view.prompt} live={live} />
      <div className="mt-6">
        <TransactionWindow
          view={view}
          store={store}
          activeChapter={activeChapter}
          displayIndex={displayIndex}
          live={live}
        />
      </div>
      {onReset && (
        <div className="mt-6 flex w-full items-center justify-end">
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 font-mono text-[12px] text-white/25 transition-colors hover:text-white/50"
          >
            New run
          </button>
        </div>
      )}
    </section>
  );
}
