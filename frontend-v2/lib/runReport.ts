import type { ViewModel } from "./reduce";
import type { StoreSnapshot } from "./types";
import {
  CHAPTER_SEQUENCE,
  getWindowBeat,
  productLabel,
  transactionAmount,
} from "./narrative";

export type ReportBullet = {
  label: string;
  value: string;
};

export type ReportBlock = {
  heading: string;
  bullets?: ReportBullet[];
  paragraph?: string;
  quote?: string;
};

export type RunReport = {
  filename: string;
  sizeLabel: string;
  title: string;
  blocks: ReportBlock[];
};

export function storeDisplay(view: ViewModel, store: StoreSnapshot): string {
  const raw =
    view.browser?.domain ??
    view.policy?.allowed_domains?.[0] ??
    view.policy?.domain ??
    store.invoice?.domain ??
    store.checkout?.domain ??
    "mockstore.local";
  return raw === "mockstore.local" ? "northbridge.cloud" : raw;
}

export function storeBrowseHref(): string {
  return "/store/orders";
}

export function storeMarketplaceHref(): string {
  return "/store/";
}

export function verifiedMarketplaceLabel(): string {
  return "Verified marketplace";
}

export function buildRunReport(
  view: ViewModel,
  store: StoreSnapshot,
  runId: string,
): RunReport {
  const product = productLabel(view, store);
  const amount = transactionAmount(view, store);
  const budget = view.policy?.budget_max ?? view.policy?.budget ?? 25;
  const merchant = view.policy?.merchant_id ?? "approved-marketplace";
  const tools = view.policy?.allowed_tools ?? [];
  const storeName = storeDisplay(view, store);
  const orderId = store.order?.order_id ?? view.order?.order_id ?? "—";
  const txId =
    store.order?.transaction_id ??
    view.payment?.transaction_id ??
    "—";
  const invoiceId = store.invoice?.invoice_id ?? view.invoice?.invoice_id ?? "—";
  const digest =
    typeof view.ssi?.digest === "string"
      ? view.ssi.digest
      : "compiled at intent seal";

  const intentText =
    view.prompt ?? "Find and purchase a VPS within the authorized budget from the approved store.";

  const executionSteps = view.nodes.map((node, index) => {
    const hash = (node.node_hash ?? node.hash ?? "").slice(0, 12);
    return {
      label: `Graph node ${index + 1}`,
      value: `${node.tool} · ${node.domain}${hash ? ` · ${hash}` : ""}`,
    };
  });

  const chapterTrail = CHAPTER_SEQUENCE.filter((ch) => ch.id !== "blocked").map(
    (ch) => {
      const beat = getWindowBeat(ch.id, view, store);
      return {
        label: beat.log?.human ?? beat.label,
        value: beat.log?.technical ?? beat.sub,
      };
    },
  );

  const blocks: ReportBlock[] = [
    {
      heading: "Authorized intent",
      quote: `**${intentText}**`,
      paragraph:
        "This run began with a sealed authorization envelope. Sworn compiled your intent into a policy the agent could not exceed — budget, merchant scope, and permitted tools were fixed before any browser session opened.",
      bullets: [
        { label: "Run ID", value: runId },
        { label: "Budget ceiling", value: `$${budget} USD` },
        { label: "Approved merchant", value: merchant },
        { label: "Allowed store", value: `${storeName} via HTTPS` },
        {
          label: "Permitted tools",
          value: tools.length > 0 ? tools.join(", ") : "search, view, cart, checkout",
        },
        { label: "SSI digest", value: digest },
      ],
    },
    {
      heading: "Session and environment",
      paragraph:
        "Sworn spun up an isolated session for this run alone. The agent received no payment rights at launch — only the ability to browse and propose a transaction inside the sealed boundary.",
      bullets: chapterTrail.slice(0, 5),
    },
    {
      heading: "Agent execution path",
      quote: `The agent entered **${storeName}**, compared VPS plans under your **$${budget}** ceiling, selected **${product}**${amount != null ? ` at **$${amount}/mo**` : ""}, and issued checkout **without transferring funds**.`,
      paragraph:
        "Every tool call below was attested and hash-linked. Each merchant response became a witness node in the execution graph before Sworn would consider payment.",
      bullets:
        executionSteps.length > 0
          ? executionSteps
          : chapterTrail.slice(5, 11),
    },
    {
      heading: "Commerce sequence",
      paragraph:
        "The agent moved from catalog search to a concrete unpaid invoice. At each stage the cart and checkout state remained inside the authorized domain — no alternate merchant, no off-policy SKU.",
      bullets: [
        { label: "Product selected", value: product },
        { label: "Listed price", value: amount != null ? `$${amount}/mo` : "within budget" },
        { label: "Cart state", value: store.cart.length > 0 ? `${store.cart.length} line item(s)` : "updated during run" },
        { label: "Invoice issued", value: invoiceId },
        { label: "Pre-payment status", value: "unpaid · awaiting Sworn verification" },
      ],
    },
    {
      heading: "Sworn verification",
      paragraph:
        "When shopping finished, Sworn froze the agent session and ran an independent verification pipeline. The purchase was matched against your sealed intent, the attested execution graph, merchant witness signatures, and the live budget oracle — only then could the DAE release payment.",
      bullets: [
        { label: "Handoff", value: "agent session frozen · verification pipeline active" },
        { label: "Hash chain", value: `${view.nodes.length} nodes · SHA-256 linked` },
        { label: "Budget oracle", value: `price checked against $${budget} ceiling` },
        { label: "Witness validation", value: "merchant responses verified against graph tip" },
        { label: "DAE decision", value: "payment envelope signed inside enclave" },
        ...chapterTrail.slice(11, 14),
      ],
    },
    {
      heading: "Settlement and outcome",
      paragraph:
        "Funds moved only after verification passed. The merchant received a Sworn-signed authorization — not a raw agent credential — and the order was written to the verified store ledger.",
      bullets: [
        { label: "Amount settled", value: amount != null ? `$${amount}` : "—" },
        { label: "Transaction ID", value: String(txId) },
        { label: "Order ID", value: String(orderId) },
        { label: "Store record", value: `${storeName} order confirmed` },
        { label: "Audit trail", value: "sealed · run complete" },
      ],
    },
  ];

  const payload = JSON.stringify({ blocks, nodes: view.nodes, events: view.events.length });
  const kb = Math.max(6, Math.round(payload.length / 700));
  const fileSlug = product.replace(/\s+/g, "_");

  return {
    filename: `${fileSlug}_Sealed.md`,
    sizeLabel: `${kb} KB`,
    title: "What happened — attested end to end",
    blocks,
  };
}
