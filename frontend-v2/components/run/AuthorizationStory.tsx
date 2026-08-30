"use client";

import { useEffect, useRef, useState } from "react";
import type { ViewModel } from "@/lib/reduce";
import type { Phase, StoreSnapshot } from "@/lib/types";
import {
  chapterCopy,
  productLabel,
  transactionAmount,
  buildHumanChecks,
  humanBlockReason,
  type ChapterId,
} from "@/lib/narrative";
import { usePacedNarrative } from "@/hooks/usePacedNarrative";
import {
  NarrativeChapter,
  NarrativeHero,
  MarketplaceTag,
} from "@/components/run/NarrativeChapter";
import { HandoffBeat } from "@/components/run/HandoffBeat";
import { ProposedTransaction } from "@/components/run/ProposedTransaction";
import { AuthorizationSeal } from "@/components/run/AuthorizationSeal";
import { ResultResolution } from "@/components/run/ResultResolution";

interface AuthorizationStoryProps {
  view: ViewModel;
  store: StoreSnapshot;
  phase: Phase;
  runId: string;
  onNewRun?: () => void;
}

function ActiveChapter({
  id,
  view,
  store,
  runId,
  revealedChecks,
  onNewRun,
}: {
  id: ChapterId;
  view: ViewModel;
  store: StoreSnapshot;
  runId: string;
  revealedChecks: number;
  onNewRun?: () => void;
}) {
  const copy = chapterCopy(id, view, store);
  const product = productLabel(view, store);
  const amount = transactionAmount(view, store);
  const blocked = view.authorized === false;

  switch (id) {
    case "intent":
      return (
        <NarrativeHero
          headline={copy.headline}
          sub={copy.sub}
        />
      );

    case "agent-start":
    case "search":
      return (
        <>
          <NarrativeHero headline={copy.headline} sub={copy.sub} />
          <MarketplaceTag runId={runId} />
        </>
      );

    case "inspect":
    case "cart":
    case "checkout":
      return <NarrativeHero headline={copy.headline} sub={copy.sub} />;

    case "proposed":
      return (
        <>
          <NarrativeHero headline={copy.headline} sub={copy.sub} />
          <ProposedTransaction
            product={product}
            amount={amount}
            state="pending"
          />
        </>
      );

    case "handoff":
      return <HandoffBeat />;

    case "verify": {
      const checks = buildHumanChecks(view, store, revealedChecks);
      const sealState = blocked
        ? "blocked"
        : view.authorized === true
          ? "authorized"
          : revealedChecks > 0
            ? "checking"
            : "waiting";

      if (blocked && view.verification != null) {
        return (
          <>
            <NarrativeHero
              headline="SWORN blocked this payment"
              sub={humanBlockReason(view.blockReason)}
              accent="danger"
            />
            <AuthorizationSeal
              checks={buildHumanChecks(view, store, 4)}
              state="blocked"
              blockReason={humanBlockReason(view.blockReason)}
            />
            <ResultResolution
              product={product}
              amount={amount}
              blocked
              blockReason={humanBlockReason(view.blockReason)}
              onNewRun={onNewRun}
            />
          </>
        );
      }

      return (
        <>
          <NarrativeHero headline={copy.headline} sub={copy.sub} />
          <AuthorizationSeal checks={checks} state={sealState} />
        </>
      );
    }

    case "authorize":
      return (
        <NarrativeHero
          headline={copy.headline}
          sub={copy.sub}
          accent="emerald"
        />
      );

    case "pay":
      return (
        <>
          <NarrativeHero headline={copy.headline} sub={copy.sub} />
          <ProposedTransaction
            product={product}
            amount={amount}
            state="paid"
          />
        </>
      );

    case "result":
      return (
        <>
          <NarrativeHero headline={copy.headline} sub={copy.sub} accent="emerald" />
          <ResultResolution
            product={product}
            amount={amount}
            orderId={store.order?.order_id ?? view.order?.order_id}
            onNewRun={onNewRun}
          />
        </>
      );

    default:
      return null;
  }
}

export function AuthorizationStory({
  view,
  store,
  phase,
  runId,
  onNewRun,
}: AuthorizationStoryProps) {
  const { displayIndex, activeChapter, chapters, blocked } = usePacedNarrative(
    view,
    store,
    phase,
  );
  const [revealedChecks, setRevealedChecks] = useState(0);
  const verifyEntered = useRef<number | null>(null);

  useEffect(() => {
    setRevealedChecks(0);
    verifyEntered.current = null;
  }, [view.runId]);

  useEffect(() => {
    if (activeChapter !== "verify") {
      verifyEntered.current = null;
      return;
    }
    if (verifyEntered.current == null) {
      verifyEntered.current = Date.now();
    }

    const tick = window.setInterval(() => {
      setRevealedChecks((n) => {
        if (view.verification != null || view.authorized != null) {
          return 4;
        }
        return Math.min(4, n + 1);
      });
    }, 550);

    return () => window.clearInterval(tick);
  }, [activeChapter, view.verification, view.authorized]);

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-20 pt-6 sm:px-8 sm:pt-10">
      {chapters.map((chapter, i) => {
        const state =
          i < displayIndex ? "done" : i === displayIndex ? "active" : "upcoming";
        const copy = chapterCopy(chapter.id, view, store);

        if (state === "done" && copy.summary) {
          return (
            <NarrativeChapter
              key={chapter.id}
              summary={copy.summary}
              state="done"
            />
          );
        }

        if (state === "active") {
          return (
            <NarrativeChapter key={chapter.id} summary="" state="active">
              <ActiveChapter
                id={activeChapter}
                view={view}
                store={store}
                runId={runId}
                revealedChecks={revealedChecks}
                onNewRun={onNewRun}
              />
            </NarrativeChapter>
          );
        }

        return null;
      })}
    </div>
  );
}
