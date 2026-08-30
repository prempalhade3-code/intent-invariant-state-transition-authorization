"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShoppingCart, Search, CheckCircle2, Brain } from "lucide-react";
import { cn } from "@/lib/cn";
import { fetchProducts } from "@/lib/api";
import type { ChapterId } from "@/lib/narrative";
import { productLabel, transactionAmount } from "@/lib/narrative";
import type { ViewModel } from "@/lib/reduce";
import type { Product, StoreSnapshot } from "@/lib/types";

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "vps-basic",
    name: "VPS Basic",
    category: "VPS",
    price: 20,
    inventory: 8,
    domain: "mockstore.local",
    merchant_id: "approved-marketplace",
    description: "2 vCPU · 4GB RAM",
  },
  {
    id: "vps-pro",
    name: "VPS Pro",
    category: "VPS",
    price: 35,
    inventory: 5,
    domain: "mockstore.local",
    merchant_id: "approved-marketplace",
    description: "4 vCPU · 8GB RAM",
  },
];

function BrowserChrome({
  url,
  locked,
  children,
}: {
  url: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[220px] flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#111318] shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-white/10" />
          <span className="h-2 w-2 rounded-full bg-white/10" />
          <span className="h-2 w-2 rounded-full bg-white/10" />
        </div>
        <div className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 rounded bg-[#0A0B0D] px-2 py-0.5">
          {locked && <Lock className="h-2.5 w-2.5 shrink-0 text-white/30" />}
          <span className="truncate font-mono text-[9px] text-white/40">{url}</span>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

interface MarketplaceWindowProps {
  view: ViewModel;
  store: StoreSnapshot;
  activeChapter: ChapterId;
  locked: boolean;
  className?: string;
}

export function MarketplaceWindow({
  view,
  store,
  activeChapter,
  locked,
  className,
}: MarketplaceWindowProps) {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [typedQuery, setTypedQuery] = useState("");

  const budget = view.policy?.budget_max ?? view.policy?.budget ?? 25;
  const selectedId =
    view.selectedProduct ?? store.checkout?.product_id ?? store.invoice?.product_id ?? "vps-basic";
  const product = productLabel(view, store);
  const amount = transactionAmount(view, store);
  const selectedProduct = products.find((p) => p.id === selectedId) ?? FALLBACK_PRODUCTS[0];

  useEffect(() => {
    fetchProducts("VPS")
      .then((r) => {
        if (r.products?.length) setProducts(r.products);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeChapter !== "search") {
      setTypedQuery("");
      return;
    }
    const target = "VPS under $25";
    let i = 0;
    const tick = window.setInterval(() => {
      i += 1;
      setTypedQuery(target.slice(0, i));
      if (i >= target.length) window.clearInterval(tick);
    }, 90);
    return () => window.clearInterval(tick);
  }, [activeChapter]);

  const urlForChapter = (): string => {
    switch (activeChapter) {
      case "understood":
        return "agent.local/understood";
      case "agent-start":
        return "northbridge.cloud/connecting…";
      case "search":
        return "northbridge.cloud/products?q=vps";
      case "inspect":
        return `northbridge.cloud/products/${selectedId}`;
      case "cart":
        return "northbridge.cloud/cart";
      case "checkout":
      case "proposed":
        return "northbridge.cloud/checkout";
      case "pay":
      case "result":
        return "northbridge.cloud/order/confirmed";
      default:
        return "northbridge.cloud";
    }
  };

  const showOrder = activeChapter === "pay" || activeChapter === "result";

  return (
    <div className={cn("w-full lg:w-[320px] lg:shrink-0", className)}>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
        Agent at work
      </p>

      <BrowserChrome url={urlForChapter()} locked={locked}>
        <AnimatePresence mode="wait">
          {activeChapter === "understood" && (
            <motion.div
              key="understood"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center"
            >
              <Brain className="h-6 w-6 text-[#10B981]/70" />
              <p className="text-[12px] font-medium text-white/70">Task understood</p>
              <p className="text-[10px] text-white/35">Ready to enter marketplace</p>
            </motion.div>
          )}

          {activeChapter === "agent-start" && (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-2 p-4"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-7 w-7 rounded-lg border border-white/[0.08] bg-white/[0.03]"
              />
              <p className="text-[11px] text-white/40">Connecting…</p>
            </motion.div>
          )}

          {activeChapter === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 p-3"
            >
              <div className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-[#0A0B0D] px-2 py-1.5">
                <Search className="h-3 w-3 text-white/30" />
                <span className="font-mono text-[10px] text-white/55">{typedQuery}|</span>
              </div>
              {products.slice(0, 2).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.3 }}
                  className={cn(
                    "flex justify-between rounded border px-2 py-1.5 text-[10px]",
                    p.price <= budget ? "border-white/[0.06]" : "border-white/[0.04] opacity-40",
                  )}
                >
                  <span className="text-white/65">{p.name}</span>
                  <span className="font-mono text-white/50">${p.price}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeChapter === "inspect" && (
            <motion.div key="inspect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3">
              <div className="rounded-lg border border-[#10B981]/25 bg-[#10B981]/[0.06] p-3">
                <p className="text-[11px] font-medium text-white/80">{selectedProduct.name}</p>
                <p className="mt-1 font-mono text-[14px] text-white/70">${selectedProduct.price}/mo</p>
              </div>
            </motion.div>
          )}

          {activeChapter === "cart" && (
            <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] p-2">
                <ShoppingCart className="h-3.5 w-3.5 text-[#10B981]" />
                <span className="text-[11px] text-white/65">{product} · ${selectedProduct.price}</span>
              </div>
            </motion.div>
          )}

          {(activeChapter === "checkout" || activeChapter === "proposed") && (
            <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3">
              <div className="rounded-lg border border-white/[0.08] p-3">
                <p className="text-[10px] text-white/40">Invoice · unpaid</p>
                <p className="mt-1 text-[12px] font-medium text-white/75">{product}</p>
                <p className="font-mono text-[13px] text-white/60">${amount ?? selectedProduct.price}</p>
              </div>
            </motion.div>
          )}

          {showOrder && (
            <motion.div
              key="order"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center gap-2 p-4"
            >
              <CheckCircle2 className="h-8 w-8 text-[#10B981]" />
              <p className="text-[12px] font-medium text-white/75">Order confirmed</p>
              <p className="text-[10px] text-white/40">
                {product}{amount != null && ` · $${amount}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </BrowserChrome>
    </div>
  );
}
