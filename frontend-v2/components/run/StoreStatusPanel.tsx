"use client";

import { ExternalLink, ShoppingBag, FileText, Package, CreditCard } from "lucide-react";
import { cn } from "@/lib/cn";
import { agentActionLabel } from "@/lib/reduce";
import type { StoreSnapshot, TransactionStage } from "@/lib/types";

interface StoreStatusPanelProps {
  runId: string;
  store: StoreSnapshot;
  stage: TransactionStage;
  productId?: string | null;
  className?: string;
}

function StoreLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:border-[#10B981]/40 hover:text-[#10B981]"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function StatusRow({
  icon: Icon,
  title,
  status,
  detail,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  status: "empty" | "active" | "done";
  detail?: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border px-4 py-4 transition-colors duration-500",
        active
          ? "border-[#10B981]/30 bg-[#10B981]/[0.06]"
          : status === "done"
            ? "border-white/[0.06] bg-white/[0.02]"
            : "border-white/[0.04] bg-transparent",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          status === "done" && "bg-[#10B981]/10 text-[#10B981]",
          status === "active" && "bg-[#10B981]/15 text-[#10B981]",
          status === "empty" && "bg-white/[0.04] text-white/25",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-white/85">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-white/40">
          {detail ?? (status === "empty" ? "Waiting for agent" : "Confirmed in store")}
        </p>
      </div>
      {status === "done" && (
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-[#10B981]">
          Live
        </span>
      )}
    </div>
  );
}

export function StoreStatusPanel({
  runId,
  store,
  stage,
  productId,
  className,
}: StoreStatusPanelProps) {
  const q = `?run=${encodeURIComponent(runId)}`;
  const cartCount = store.cart.reduce((n, i) => n + i.quantity, 0);
  const cartDone = cartCount > 0;
  const checkoutDone = Boolean(store.checkout || store.invoice);
  const orderDone = Boolean(store.order);

  const cartActive = stage === "cart";
  const checkoutActive = stage === "checkout";
  const orderActive = stage === "pay" || stage === "complete";

  const cartDetail = cartDone
    ? store.cart.map((i) => `${i.name ?? i.product_id} × ${i.quantity}`).join(", ")
    : undefined;

  const checkoutDetail = checkoutDone
    ? store.invoice
      ? `Invoice ${store.invoice.invoice_id} · $${store.invoice.price}`
      : store.checkout
        ? `Checkout ${store.checkout.checkout_id} · $${store.checkout.price}`
        : undefined
    : undefined;

  const orderDetail = orderDone
    ? `Order ${store.order!.order_id ?? store.order!.transaction_id} · ${store.order!.status}`
    : undefined;

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Store state
          </p>
          <h2 className="mt-1.5 text-[20px] font-medium tracking-[-0.02em] text-[#F4F5F7]">
            Northbridge Cloud
          </h2>
          <p className="mt-1 text-[13px] text-white/40">
            Separate merchant site — open anytime to verify real cart, invoice, and order state.
          </p>
        </div>
        <StoreLink href={`/store/${q}`} label="Open store" />
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0D0E12]/60 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/30">
          Agent activity
        </p>
        <p className="mt-1 text-[14px] text-white/70">{agentActionLabel(stage, productId)}</p>
      </div>

      <div className="space-y-3">
        <StatusRow
          icon={ShoppingBag}
          title="Cart"
          status={cartDone ? "done" : cartActive ? "active" : "empty"}
          detail={cartDetail}
          active={cartActive}
        />
        <StatusRow
          icon={FileText}
          title="Checkout & invoice"
          status={checkoutDone ? "done" : checkoutActive ? "active" : "empty"}
          detail={checkoutDetail}
          active={checkoutActive}
        />
        <StatusRow
          icon={Package}
          title="Order"
          status={orderDone ? "done" : orderActive ? "active" : "empty"}
          detail={orderDetail}
          active={orderActive}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <StoreLink href={`/store/cart${q}`} label="Cart" />
        <StoreLink href={`/store/checkout${q}`} label="Checkout" />
        {store.invoice && (
          <StoreLink href={`/store/invoice/${store.invoice.invoice_id}`} label="Invoice" />
        )}
        <StoreLink href="/store/orders" label="Orders" />
        {store.order?.order_id && (
          <StoreLink href={`/store/order/${store.order.order_id}`} label="Order detail" />
        )}
      </div>

      {stage === "complete" && orderDone && (
        <div className="flex items-center gap-3 rounded-xl border border-[#10B981]/25 bg-[#10B981]/[0.08] px-4 py-3">
          <CreditCard className="h-4 w-4 shrink-0 text-[#10B981]" />
          <p className="text-[13px] text-[#10B981]/90">
            Payment settled · cart cleared · order visible in store
          </p>
        </div>
      )}
    </div>
  );
}
