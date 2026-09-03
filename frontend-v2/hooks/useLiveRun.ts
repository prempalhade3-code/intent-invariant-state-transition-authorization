"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRun,
  fetchCart,
  fetchCheckoutByRun,
  fetchOrders,
  getEvents,
  getRun,
  resetRun,
  runScenario,
  startRun,
  DEFAULT_PROMPT,
} from "@/lib/api";
import { emptyView, reduceEvents, viewFromScenario, type ViewModel } from "@/lib/reduce";
import type { OrderData, Phase, StoreSnapshot } from "@/lib/types";

const emptyStore = (): StoreSnapshot => ({
  cart: [],
  checkout: null,
  invoice: null,
  order: null,
});

export function useLiveRun(initialRunId?: string) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);
  const [view, setView] = useState<ViewModel>(emptyView);
  const [store, setStore] = useState<StoreSnapshot>(emptyStore);
  const [error, setError] = useState<string | null>(null);
  const [activeAttack, setActiveAttack] = useState<string | null>(null);
  const seq = useRef(0);
  const runId = useRef<string | null>(initialRunId ?? null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const settledRef = useRef(false);
  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "settled") settledRef.current = true;
  }, [phase]);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const pollStore = useCallback(async (id: string, orderHint?: OrderData | null) => {
    try {
      const [cartRes, checkoutRes, ordersRes] = await Promise.all([
        fetchCart(id).catch(() => ({ run_id: id, cart: [] })),
        fetchCheckoutByRun(id).catch(() => ({ run_id: id, checkout: null, invoice: null })),
        fetchOrders(id).catch(() => ({ orders: [] })),
      ]);
      const checkout = checkoutRes.checkout;
      const invoice = checkoutRes.invoice;
      const order = ordersRes.orders[0] ?? orderHint ?? null;
      setStore({
        cart: cartRes.cart ?? [],
        checkout: checkout
          ? {
              checkout_id: String(checkout.checkout_id ?? ""),
              invoice_id: String(checkout.invoice_id ?? invoice?.invoice_id ?? ""),
              product_id: String(checkout.product_id ?? invoice?.product_id ?? ""),
              price: Number(checkout.price ?? invoice?.price ?? 0),
              domain: String(invoice?.domain ?? "mockstore.local"),
              merchant_id: String(invoice?.merchant_id ?? "approved-marketplace"),
            }
          : null,
        invoice: invoice
          ? {
              invoice_id: invoice.invoice_id,
              checkout_id: invoice.checkout_id,
              product_id: invoice.product_id,
              price: invoice.price,
              domain: invoice.domain,
              merchant_id: invoice.merchant_id,
            }
          : null,
        order: order
          ? {
              order_id: order.order_id,
              status: order.status,
              transaction_id: order.transaction_id,
              amount: order.price ?? order.amount ?? 0,
              invoice_id: order.invoice_id,
              product_id: order.product_id,
              run_id: order.run_id,
            }
          : null,
      });
    } catch {
      /* store poll is best-effort */
    }
  }, []);

  const ingest = useCallback(async (id: string) => {
    const [record, stream] = await Promise.all([
      getRun(id),
      getEvents(id, seq.current),
    ]);
    if (stream.events.length) {
      seq.current = Math.max(seq.current, ...stream.events.map((e) => e.sequence));
    }
    let nextView = emptyView();
    setView((prev) => {
      const merged = [...prev.events];
      for (const event of stream.events) {
        if (!merged.some((e) => e.sequence === event.sequence && e.event_type === event.event_type)) {
          merged.push(event);
        }
      }
      nextView = reduceEvents(merged, record);
      return nextView;
    });
    await pollStore(id, nextView.order);
    return record;
  }, [pollStore]);

  const poll = useCallback(
    (id: string) => {
      stop();
      const tick = async () => {
        try {
          const record = await ingest(id);
          if (
            record.status === "completed" ||
            record.status === "blocked" ||
            record.status === "error" ||
            record.status === "cancelled"
          ) {
            stop();
            setPhase("settled");
          }
        } catch (cause) {
          stop();
          setError(cause instanceof Error ? cause.message : "Event stream failed");
          setPhase("error");
        }
      };
      void tick();
      timer.current = setInterval(tick, 400);
    },
    [ingest, stop],
  );

  useEffect(() => {
    if (!initialRunId || phase !== "idle") return;
    runId.current = initialRunId;
    settledRef.current = false;
    setPhase("live");

    let cancelled = false;
    (async () => {
      try {
        await startRun(initialRunId);
        if (!cancelled) poll(initialRunId);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Could not start run");
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRunId]);

  const startAutonomous = useCallback(
    async (nextPrompt: string, demoEvent?: string, attackId?: string, navigate = true) => {
      stop();
      seq.current = 0;
      setError(null);
      setView(emptyView());
      setStore(emptyStore());
      setActiveAttack(attackId ?? null);
      setSubmittedPrompt(nextPrompt);
      setPhase("submitting");
      try {
        const created = await createRun(nextPrompt, demoEvent);
        runId.current = created.run_id;
        settledRef.current = false;
        setView(reduceEvents([], { run_id: created.run_id, status: created.status, policy: created.intent }));
        setPhase("live");
        await startRun(created.run_id);
        poll(created.run_id);
        if (navigate) router.push(`/run/${created.run_id}`);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not start run");
        setPhase("error");
      }
    },
    [poll, router, stop],
  );

  const startScenario = useCallback(
    async (scenario: string, attackId: string) => {
      stop();
      seq.current = 0;
      runId.current = null;
      setError(null);
      setActiveAttack(attackId);
      setPhase("submitting");
      setView(emptyView());
      setStore(emptyStore());
      try {
        const result = await runScenario(scenario);
        setView(viewFromScenario(result, scenario));
        setPhase("settled");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Scenario failed");
        setPhase("error");
      }
    },
    [stop],
  );

  const reset = useCallback(async () => {
    stop();
    if (runId.current) {
      try {
        await resetRun(runId.current);
      } catch {
        /* best-effort */
      }
    }
    runId.current = null;
    seq.current = 0;
    setActiveAttack(null);
    setSubmittedPrompt(null);
    setError(null);
    setView(emptyView());
    setStore(emptyStore());
    setPhase("idle");
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return {
    phase,
    prompt,
    setPrompt,
    submittedPrompt,
    view,
    store,
    error,
    activeAttack,
    runId: runId.current,
    startAutonomous,
    startScenario,
    reset,
    pollStore,
  };
}
