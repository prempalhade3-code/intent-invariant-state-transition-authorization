"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { buildRunReport, storeDisplay, type ReportBlock } from "@/lib/runReport";
import { productLabel, transactionAmount } from "@/lib/narrative";
import type { ViewModel } from "@/lib/reduce";
import type { StoreSnapshot } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

function openStore(path: string) {
  window.open(path, "_blank", "noopener,noreferrer");
}

const storeLinkClassName =
  "text-[#10B981]/80 underline-offset-2 transition-colors hover:text-[#10B981] hover:underline";
const actionLinkClassName =
  "relative z-10 inline-flex cursor-pointer items-center rounded-full border border-white/[0.12] bg-white/[0.03] px-4 py-2 font-mono text-[11px] text-white/55 transition-colors hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white/80";

interface RunReportViewportProps {
  view: ViewModel;
  store: StoreSnapshot;
  runId: string;
  visible: boolean;
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#F4F5F7]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function ReportBlockView({ block }: { block: ReportBlock }) {
  return (
    <section className="mb-7 last:mb-0">
      <h3 className="font-sans text-[16px] font-semibold tracking-[-0.02em] text-[#F4F5F7]">
        {block.heading}
      </h3>
      {block.quote && (
        <blockquote className="mt-3 border-l-2 border-[#10B981]/30 pl-3.5 font-sans text-[14px] leading-[1.65] text-white/60">
          {renderInlineBold(block.quote)}
        </blockquote>
      )}
      {block.paragraph && (
        <p className="mt-3 font-sans text-[14px] leading-[1.65] text-white/55">
          {block.paragraph}
        </p>
      )}
      {block.bullets && block.bullets.length > 0 && (
        <ul className="mt-3 space-y-2">
          {block.bullets.map((item, index) => (
            <li
              key={`${item.label}-${index}`}
              className="flex gap-2 font-sans text-[13px] leading-[1.55] text-white/55"
            >
              <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#10B981]/50" />
              <span>
                <strong className="font-medium text-white/75">{item.label}:</strong>{" "}
                <span className="font-mono text-[12px] text-[#10B981]/60">{item.value}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReportViewer({
  report,
  onClose,
}: {
  report: ReturnType<typeof buildRunReport>;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.45, ease }}
      className="w-full max-w-[672px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] bg-[#2b2b2b] px-4 py-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#10B981]" />
        <span className="font-mono text-[11px] text-white/45">Agent</span>
        <span className="text-white/15">|</span>
        <span className="min-w-0 truncate font-mono text-[11px] text-white/60">
          {report.filename}
        </span>
        <span className="ml-auto shrink-0 font-mono text-[10px] text-white/30">
          {report.sizeLabel}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/70"
          aria-label="Close report"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="max-h-[min(72vh,680px)] overflow-y-auto px-7 py-6">
        <h2 className="font-sans text-[20px] font-semibold tracking-[-0.03em] text-[#F4F5F7]">
          {report.title}
        </h2>
        <div className="mt-6">
          {report.blocks.map((block) => (
            <ReportBlockView key={block.heading} block={block} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function TransactionCard({
  product,
  amount,
  orderId,
  invoiceId,
  storeName,
  index,
}: {
  product: string;
  amount: number | null;
  orderId: string;
  invoiceId: string;
  storeName: string;
  index: number;
}) {
  const orderReady = orderId !== "—";
  const invoiceReady = invoiceId !== "—";
  const orderHref = `/store/order/${orderId}`;
  const invoiceHref = `/store/invoice/${invoiceId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease, delay: 0.08 + index * 0.12 }}
      className="relative z-10 flex h-full min-h-[280px] flex-col overflow-hidden rounded-[20px] border border-[#10B981]/20 bg-[#12141a] shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:min-h-[380px] sm:rounded-[20px]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <span className="rounded-full bg-[#10B981] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#0A0B0D]">
          Payment settled
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-white/35">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          live · Sworn signed
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <p className="font-sans text-[15px] font-semibold tracking-[-0.02em] text-[#F4F5F7]">
          Transaction authorized
        </p>
        <p className="mt-3 font-sans text-[14px] leading-[1.6] text-white/50">
          Your agent purchased <strong className="font-medium text-white/80">{product}</strong>
          {amount != null ? (
            <>
              {" "}
              for <strong className="font-medium text-white/80">${amount}</strong>
            </>
          ) : null}
          . Sworn verified the execution path before releasing payment to{" "}
          <strong className="font-medium text-white/80">{storeName}</strong>.
        </p>

        <div className="mt-5 rounded-lg border border-white/[0.08] bg-[#0A0B0D] px-4 py-3.5 font-mono text-[11px] leading-[1.85] text-white/45">
          <p>
            <span className="text-white/30">product</span> = {product}
          </p>
          {amount != null && (
            <p>
              <span className="text-white/30">amount</span> = ${amount}
            </p>
          )}
          <p>
            <span className="text-white/30">order</span> ={" "}
            {orderReady ? (
              <a
                href={orderHref}
                target="_blank"
                rel="noopener noreferrer"
                className={storeLinkClassName}
              >
                {orderId}
              </a>
            ) : (
              orderId
            )}
          </p>
          <p>
            <span className="text-white/30">invoice</span> ={" "}
            {invoiceReady ? (
              <a
                href={invoiceHref}
                target="_blank"
                rel="noopener noreferrer"
                className={storeLinkClassName}
              >
                {invoiceId}
              </a>
            ) : (
              invoiceId
            )}
          </p>
          <p>
            <span className="text-white/30">store</span> ={" "}
            <a
              href="/store/orders"
              target="_blank"
              rel="noopener noreferrer"
              className={storeLinkClassName}
            >
              {storeName}/orders
            </a>
          </p>
        </div>

        <div className="relative z-10 mt-auto flex flex-wrap gap-3 pt-5">
          <a
            href={orderHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              if (!orderReady) {
                event.preventDefault();
                return;
              }
              event.preventDefault();
              openStore(orderHref);
            }}
            className={`${actionLinkClassName}${orderReady ? "" : " pointer-events-none opacity-40"}`}
            aria-disabled={!orderReady}
          >
            View order
          </a>
          <a
            href={invoiceHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              if (!invoiceReady) {
                event.preventDefault();
                return;
              }
              event.preventDefault();
              openStore(invoiceHref);
            }}
            className={`${actionLinkClassName}${invoiceReady ? "" : " pointer-events-none opacity-40"}`}
            aria-disabled={!invoiceReady}
          >
            View invoice
          </a>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-5 py-3 font-mono text-[10px] text-white/30">
        Merchant proof · clickable order · Sworn authorization
      </div>
    </motion.div>
  );
}

function DocumentCard({
  filename,
  sizeLabel,
  onView,
  index,
}: {
  filename: string;
  sizeLabel: string;
  onView: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease, delay: 0.08 + index * 0.12 }}
      className="flex h-full min-h-[280px] flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#12141a]/80 shadow-[0_4px_24px_rgba(0,0,0,0.3)] sm:min-h-[380px]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
          Attested trace
        </span>
        <span className="font-mono text-[10px] text-white/30">{sizeLabel}</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0A0B0D]">
          <span className="font-mono text-[12px] font-medium text-white/35">MD</span>
        </div>
        <p className="mt-5 max-w-[240px] truncate text-center font-sans text-[15px] font-medium text-[#F4F5F7]">
          {filename}
        </p>
        <p className="mt-2 max-w-[260px] text-center font-sans text-[13px] leading-[1.55] text-white/45">
          Full step-by-step record of what the agent did and how Sworn verified it.
        </p>
      </div>

      <div className="flex items-center justify-end border-t border-white/[0.06] px-5 py-3">
        <button
          type="button"
          onClick={onView}
          className="font-mono text-[11px] text-white/40 transition-colors hover:text-white/70"
        >
          View
        </button>
      </div>
    </motion.div>
  );
}

export const REPORT_SECTION_ID = "run-report-viewport";

export function RunReportViewport({
  view,
  store,
  runId,
  visible,
}: RunReportViewportProps) {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const report = useMemo(() => buildRunReport(view, store, runId), [view, store, runId]);

  const product = productLabel(view, store);
  const amount = transactionAmount(view, store);
  const storeName = storeDisplay(view, store);
  const orderId =
    store.order?.order_id ??
    view.order?.order_id ??
    view.payment?.order_id ??
    "—";
  const invoiceId =
    store.invoice?.invoice_id ??
    view.invoice?.invoice_id ??
    view.payment?.invoice_id ??
    view.order?.invoice_id ??
    "—";

  if (!visible) return null;

  return (
    <section
      id={REPORT_SECTION_ID}
      ref={sectionRef}
      className="relative z-10 flex min-h-screen items-start justify-center bg-[#0A0B0D] px-6 pb-16 pt-12 sm:px-10"
    >
      <div className="w-full max-w-[920px]">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="mb-8 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-white/35"
        >
          What Sworn witnessed
        </motion.p>

        <AnimatePresence mode="wait">
          {open ? (
            <div className="flex justify-center">
              <ReportViewer report={report} onClose={() => setOpen(false)} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <TransactionCard
                product={product}
                amount={amount}
                orderId={String(orderId)}
                invoiceId={String(invoiceId)}
                storeName={storeName}
                index={0}
              />
              <DocumentCard
                filename={report.filename}
                sizeLabel={report.sizeLabel}
                onView={() => setOpen(true)}
                index={1}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
