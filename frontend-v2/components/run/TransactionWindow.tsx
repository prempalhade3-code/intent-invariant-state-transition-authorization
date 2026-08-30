"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/cn";
import { useElapsedTimer } from "@/hooks/useElapsedTimer";
import type { ChapterId } from "@/lib/narrative";
import { buildWindowLog, chapterIndex, getWindowBeat } from "@/lib/narrative";
import { storeDisplay, storeMarketplaceHref } from "@/lib/runReport";
import type { ViewModel } from "@/lib/reduce";
import type { StoreSnapshot } from "@/lib/types";

/** Coarena Agent A + B combined footprint (+1in each side, +1in bottom) */
export const TERMINAL_W = 1376;
export const TERMINAL_H = 816;

interface TransactionWindowProps {
  view: ViewModel;
  store: StoreSnapshot;
  activeChapter: ChapterId;
  displayIndex: number;
  live?: boolean;
}

function LogLine({
  human,
  technical,
  dim,
}: {
  human: string;
  technical: string;
  dim?: boolean;
}) {
  return (
    <div className={cn("mb-5 shrink-0", dim && "opacity-55")}>
      <p className="truncate text-[14px] font-normal leading-none text-white/75">
        {human}
      </p>
      <p className="mt-1.5 truncate text-[12px] font-normal leading-none text-[#10B981]/55">
        {technical}
      </p>
    </div>
  );
}

export function TransactionWindow({
  view,
  store,
  activeChapter,
  displayIndex,
  live,
}: TransactionWindowProps) {
  const beat = getWindowBeat(activeChapter, view, store);
  const log = useMemo(
    () => buildWindowLog(displayIndex, view, store),
    [displayIndex, view, store],
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isBoot = activeChapter === "spin-up";
  const { label: elapsed } = useElapsedTimer(isBoot);
  const storeConnected = chapterIndex(activeChapter) >= chapterIndex("connect");
  const storeName = storeDisplay(view, store);

  const isComplete = activeChapter === "result";
  const isBlocked = view.authorized === false && activeChapter === "verify";

  const pending =
    !isBoot &&
    beat.log &&
    !log.some((e) => e.chapterId === activeChapter)
      ? { human: beat.log.human, technical: beat.log.technical }
      : null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log.length, activeChapter, pending?.human]);

  return (
    <div
      className="flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      style={{ width: "100%", maxWidth: TERMINAL_W, height: TERMINAL_H }}
    >
      <div className="grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-black/40 bg-[#2b2b2b] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              live ? "bg-[#10B981]" : isComplete ? "bg-[#10B981]/60" : "bg-white/20",
            )}
          />
          <span className="font-mono text-[11px] text-white/45">Agent</span>
        </div>
        <div className="min-w-0 text-right font-mono text-[10px]">
          {storeConnected && (
            <>
              <span className="text-white/40">Verified marketplace · </span>
              <a
                href={storeMarketplaceHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#10B981]/75 transition-colors hover:text-[#10B981]"
              >
                {storeName}
              </a>
            </>
          )}
        </div>
      </div>

      {isBoot ? (
        <div className="flex min-h-0 flex-1 flex-col px-10 font-mono">
          <div className="flex flex-1 flex-col items-center justify-end pb-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
              {beat.label}
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-center">
            <p className="text-[36px] font-normal tabular-nums tracking-tight text-white/85">
              {elapsed}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-start pt-6 text-center">
            <p className="max-w-[440px] text-[13px] font-normal leading-[1.6] text-white/40">
              {beat.sub}
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-8 py-6 font-mono scroll-smooth"
        >
          {log.map((entry) => (
            <LogLine
              key={entry.chapterId}
              human={entry.human}
              technical={entry.technical}
            />
          ))}

          {pending && (
            <LogLine human={pending.human} technical={pending.technical} dim />
          )}

          {isComplete && !isBlocked && store.order?.order_id && (
            <p className="truncate text-[12px] text-white/35">
              order confirmed{" "}
              <a
                href={`/store/order/${store.order.order_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#10B981]/70 hover:text-[#10B981]"
              >
                view in store
              </a>
            </p>
          )}
          <div ref={endRef} className="h-px shrink-0" aria-hidden />
        </div>
      )}
    </div>
  );
}
