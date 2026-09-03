import type { ViewModel } from "./reduce";
import type { Phase, StoreSnapshot } from "./types";

export type ChapterId =
  | "spin-up"
  | "intent"
  | "connect"
  | "fathom"
  | "understood"
  | "agent-start"
  | "search"
  | "inspect"
  | "cart"
  | "checkout"
  | "proposed"
  | "handoff"
  | "verify"
  | "authorize"
  | "pay"
  | "result"
  | "blocked";

export type ChapterDef = {
  id: ChapterId;
  minDwell: number;
  act: "setup" | "agent" | "handoff" | "sworn" | "result";
};

export const CHAPTER_SEQUENCE: ChapterDef[] = [
  { id: "spin-up", minDwell: 5000, act: "setup" },
  { id: "intent", minDwell: 4500, act: "setup" },
  { id: "connect", minDwell: 5500, act: "setup" },
  { id: "fathom", minDwell: 5000, act: "setup" },
  { id: "understood", minDwell: 4500, act: "setup" },
  { id: "agent-start", minDwell: 5000, act: "agent" },
  { id: "search", minDwell: 5500, act: "agent" },
  { id: "inspect", minDwell: 5000, act: "agent" },
  { id: "cart", minDwell: 4500, act: "agent" },
  { id: "checkout", minDwell: 5000, act: "agent" },
  { id: "proposed", minDwell: 4500, act: "agent" },
  { id: "handoff", minDwell: 5000, act: "handoff" },
  { id: "verify", minDwell: 6000, act: "sworn" },
  { id: "authorize", minDwell: 4500, act: "sworn" },
  { id: "pay", minDwell: 4500, act: "sworn" },
  { id: "result", minDwell: 4000, act: "result" },
];

export type WindowLogEntry = {
  chapterId: ChapterId;
  human: string;
  technical: string;
};

export type WindowBeat = {
  label: string;
  headline: string;
  sub: string;
  log?: { human: string; technical: string };
};

export type StageMarker = {
  id: string;
  label: string;
  chapters: ChapterId[];
};

export const STAGE_MARKERS: StageMarker[] = [
  { id: "sealed", label: "Sealed", chapters: ["spin-up", "intent", "connect", "fathom", "understood"] },
  { id: "shopping", label: "Agent shops", chapters: ["agent-start", "search", "inspect", "cart", "checkout", "proposed"] },
  { id: "handoff", label: "Handoff", chapters: ["handoff"] },
  { id: "verify", label: "SWORN verifies", chapters: ["verify"] },
  { id: "authorize", label: "Authorized", chapters: ["authorize", "pay"] },
  { id: "done", label: "Done", chapters: ["result"] },
];

export function chapterIndex(id: ChapterId): number {
  return CHAPTER_SEQUENCE.findIndex((c) => c.id === id);
}

export function isSwornChapter(id: ChapterId): boolean {
  const idx = chapterIndex(id);
  const handoffIdx = chapterIndex("handoff");
  return idx >= handoffIdx;
}

export function isSwornFocusChapter(id: ChapterId): boolean {
  return (
    id === "handoff" ||
    id === "verify" ||
    id === "authorize" ||
    id === "pay" ||
    id === "result"
  );
}

export function markerState(
  marker: StageMarker,
  activeChapter: ChapterId,
  displayIndex: number,
  blocked: boolean,
): "done" | "active" | "pending" | "blocked" {
  const activeIdx = chapterIndex(activeChapter);
  const markerMaxIdx = Math.max(...marker.chapters.map(chapterIndex));
  const markerMinIdx = Math.min(...marker.chapters.map(chapterIndex));

  if (blocked && marker.id === "verify" && activeChapter === "verify") return "blocked";
  if (displayIndex > markerMaxIdx) return "done";
  if (activeIdx >= markerMinIdx && activeIdx <= markerMaxIdx) return "active";
  if (displayIndex >= markerMaxIdx) return "done";
  return "pending";
}

export type HumanCheck = {
  id: string;
  label: string;
  detail: string;
  state: "wait" | "ok" | "bad";
};

function hasEvent(view: ViewModel, type: string, tool?: string): boolean {
  return view.events.some((e) => {
    if (e.event_type !== type) return false;
    if (tool && e.payload?.tool !== tool) return false;
    return true;
  });
}

export function isChapterConfirmed(
  id: ChapterId,
  view: ViewModel,
  store: StoreSnapshot,
  phase: Phase,
): boolean {
  switch (id) {
    case "spin-up":
      return Boolean(view.runId);
    case "intent":
      return Boolean(view.policy) || hasEvent(view, "intent_normalized") || hasEvent(view, "policy_sealed");
    case "connect":
    case "fathom":
    case "understood":
      return isChapterConfirmed("intent", view, store, phase);
    case "agent-start":
      return hasEvent(view, "agent_plan_created") || hasEvent(view, "browser_started");
    case "search":
      return (
        hasEvent(view, "browser_action", "search_products") ||
        hasEvent(view, "merchant_response", "search_products")
      );
    case "inspect":
      return Boolean(view.selectedProduct) || hasEvent(view, "agent_decision");
    case "cart":
      return store.cart.length > 0 || hasEvent(view, "merchant_response", "add_to_cart");
    case "checkout":
      return Boolean(store.checkout || store.invoice) || hasEvent(view, "merchant_response", "checkout");
    case "proposed":
      return Boolean(store.checkout || store.invoice || view.checkout);
    case "handoff":
      return isChapterConfirmed("proposed", view, store, phase);
    case "verify":
      return (
        hasEvent(view, "verification_result") ||
        hasEvent(view, "authorization_blocked")
      );
    case "authorize":
      return view.authorized === true;
    case "pay":
      return (
        hasEvent(view, "payment_settled") ||
        Boolean(store.order || view.order || view.payment)
      );
    case "result":
      return (
        phase === "settled" &&
        view.authorized === true &&
        hasEvent(view, "payment_settled")
      );
    case "blocked":
      return view.authorized === false && (phase === "settled" || view.verification != null);
    default:
      return false;
  }
}

export function computeTargetIndex(
  view: ViewModel,
  store: StoreSnapshot,
  phase: Phase,
): number {
  if (view.authorized === false) {
    // Block as soon as verify confirms failure, minimum through handoff
    let last = 0;
    for (let i = 0; i < CHAPTER_SEQUENCE.length; i++) {
      const id = CHAPTER_SEQUENCE[i].id;
      if (id === "authorize" || id === "pay" || id === "result") break;
      if (isChapterConfirmed(id, view, store, phase)) last = i;
    }
    // blocked is virtual — target is last confirmed sworn chapter + blocked state handled in UI
    if (isChapterConfirmed("verify", view, store, phase)) {
      return Math.max(last, CHAPTER_SEQUENCE.findIndex((c) => c.id === "verify"));
    }
    return last;
  }

  let target = 0;
  for (let i = 0; i < CHAPTER_SEQUENCE.length; i++) {
    if (isChapterConfirmed(CHAPTER_SEQUENCE[i].id, view, store, phase)) {
      target = i;
    }
  }

  // If settled but result not yet store-confirmed, hold on pay
  if (phase === "settled" && view.authorized === true && target >= CHAPTER_SEQUENCE.length - 1) {
    target = CHAPTER_SEQUENCE.length - 1;
  }

  return target;
}

export function productLabel(view: ViewModel, store: StoreSnapshot): string {
  const id = view.selectedProduct ?? store.checkout?.product_id ?? store.invoice?.product_id ?? "item";
  if (id === "vps-basic") return "VPS Basic";
  if (id === "vps-pro") return "VPS Pro";
  if (id === "vps-backup") return "VPS Backup";
  return id;
}

export function transactionAmount(view: ViewModel, store: StoreSnapshot): number | null {
  const v =
    store.invoice?.price ??
    store.checkout?.price ??
    view.invoice?.price ??
    view.checkout?.price ??
    store.order?.amount ??
    view.order?.amount ??
    view.payment?.amount ??
    view.payment?.transaction?.amount;
  return typeof v === "number" ? v : null;
}

export function technicalBlockReason(reason: string | null): string {
  if (!reason) return "dae commit rejected policy mismatch";
  const t = reason.toLowerCase();
  if (t.includes("connection attempts failed") || t.includes("agent unavailable")) {
    return "agent executor unreachable backend services offline";
  }
  if (t.includes("run abandoned")) return "dae commit rejected run abandoned before payment";
  if (t.includes("budget") || t.includes("invoice violates")) {
    return "dae commit rejected invoice exceeds sealed budget";
  }
  if (t.includes("oracle") || t.includes("stale")) return "dae commit rejected oracle stale price";
  if (t.includes("hash") || t.includes("predecessor")) return "dae commit rejected graph hash mismatch";
  if (t.includes("merchant") || t.includes("witness")) return "dae commit rejected merchant witness invalid";
  if (t.includes("ssi rejected") || t.includes("execution path")) {
    return "dae commit rejected policy path mismatch";
  }
  return reason.length > 72 ? `${reason.slice(0, 69)}...` : reason;
}

export function humanBlockReason(reason: string | null): string {
  if (!reason) return "This transaction was not allowed.";
  const t = reason.toLowerCase();
  if (t.includes("connection attempts failed") || t.includes("agent unavailable")) {
    return "The agent could not reach the backend services.";
  }
  if (t.includes("run abandoned")) return "The run was cancelled before payment could complete.";
  if (t.includes("budget") || t.includes("invoice violates")) {
    return "The purchase amount exceeds what you authorized.";
  }
  if (t.includes("oracle") || t.includes("stale")) {
    return "The price changed after checkout — SWORN detected the mismatch.";
  }
  if (t.includes("hash") || t.includes("path") || t.includes("predecessor")) {
    return "The agent's execution path could not be verified.";
  }
  if (t.includes("merchant") || t.includes("witness")) {
    return "The merchant proof could not be verified.";
  }
  if (t.includes("dae") || t.includes("authorized by trusted")) {
    return "Payment was not signed by SWORN.";
  }
  return reason;
}

export function buildHumanChecks(
  view: ViewModel,
  store: StoreSnapshot,
  revealedCount: number,
): HumanCheck[] {
  const budget = view.policy?.budget_max ?? view.policy?.budget ?? 25;
  const amount = transactionAmount(view, store);
  const product = productLabel(view, store);
  const merchant = store.invoice?.merchant_id ?? view.policy?.merchant_id ?? "approved marketplace";
  const failed = view.authorized === false;
  const resolved = view.verification != null || view.authorized != null;

  const finalStates: HumanCheck[] = [
    {
      id: "intent-match",
      label: "Purchase matches your intent",
      detail: `${product} from ${merchant}`,
      state: resolved ? "ok" : "wait",
    },
    {
      id: "ceiling",
      label: "Amount within your ceiling",
      detail:
        amount != null
          ? failed && amount > budget
            ? `$${amount} exceeds your $${budget} limit`
            : `$${amount} is within your $${budget} limit`
          : `Checking against your $${budget} limit`,
      state:
        failed && amount != null && amount > budget
          ? "bad"
          : resolved && !(failed && amount != null && amount > budget)
            ? "ok"
            : "wait",
    },
    {
      id: "merchant",
      label: "Merchant is approved",
      detail: String(merchant),
      state:
        failed && view.blockReason?.toLowerCase().includes("merchant")
          ? "bad"
          : resolved
            ? "ok"
            : "wait",
    },
    {
      id: "integrity",
      label: "Execution untampered",
      detail:
        view.nodes.length > 0
          ? `${view.nodes.length} verified steps in the execution path`
          : "Verifying agent actions",
      state:
        failed &&
        (view.blockReason?.toLowerCase().includes("hash") ||
          view.blockReason?.toLowerCase().includes("path") ||
          view.blockReason?.toLowerCase().includes("attestation"))
          ? "bad"
          : resolved
            ? "ok"
            : "wait",
    },
  ];

  return finalStates.map((check, i) => {
    if (i >= revealedCount) {
      return { ...check, state: "wait" as const };
    }
    return check;
  });
}

export function chapterCopy(
  id: ChapterId,
  view: ViewModel,
  store: StoreSnapshot,
): { headline: string; sub?: string; summary?: string } {
  const product = productLabel(view, store);
  const amount = transactionAmount(view, store);

  switch (id) {
    case "spin-up":
      return {
        headline: "Preparing secure transaction environment",
        sub: "Initializing this run — SWORN will authorize before any payment moves.",
        summary: "Environment ready",
      };
    case "intent":
      return {
        headline: "Your intent is sealed",
        sub: "SWORN locked your budget, merchant, and allowed actions before anything else could happen.",
        summary: "Intent sealed",
      };
    case "connect":
      return {
        headline: "Connecting to authorized marketplace",
        sub: "Opening Northbridge Cloud — the only merchant you authorized.",
        summary: "Marketplace connected",
      };
    case "fathom":
      return {
        headline: "Agent is reading your request",
        sub: "Understanding what you asked for — a basic VPS under your limit, from the approved marketplace only.",
        summary: "Request parsed",
      };
    case "understood":
      return {
        headline: "Agent understood the task",
        sub: "Goal confirmed. The agent will now enter Northbridge Cloud and shop on your behalf.",
        summary: "Task understood",
      };
    case "agent-start":
      return {
        headline: "Agent entering the marketplace",
        sub: "Connecting to Northbridge Cloud — the only merchant you authorized.",
        summary: "Marketplace connected",
      };
    case "search":
      return {
        headline: "Searching marketplace",
        sub: "Northbridge Cloud · approved marketplace",
        summary: "Marketplace searched",
      };
    case "inspect":
      return {
        headline: `Inspecting ${product}`,
        sub: amount != null ? `$${amount}/mo` : "Reviewing product details",
        summary: `Selected ${product}`,
      };
    case "cart":
      return {
        headline: "Adding to cart",
        sub: store.cart.length ? `${store.cart.length} item in cart` : "Confirming cart state",
        summary: "Added to cart",
      };
    case "checkout":
      return {
        headline: "Creating checkout",
        sub: store.invoice ? `Invoice ${store.invoice.invoice_id}` : "Issuing merchant invoice",
        summary: "Checkout created",
      };
    case "proposed":
      return {
        headline: `${product}${amount != null ? ` — $${amount}` : ""}`,
        sub: "Agent finished shopping. Payment has not been made yet.",
        summary: "Transaction proposed",
      };
    case "handoff":
      return {
        headline: "SWORN takes over",
        sub: "The agent finished shopping. SWORN now checks this transaction independently.",
        summary: "Handoff to SWORN",
      };
    case "verify":
      return {
        headline: "Verifying transaction",
        sub: "Checking the purchase against what you authorized.",
        summary: "Verification complete",
      };
    case "authorize":
      return {
        headline: "Authorized",
        sub: "Verification passed — SWORN released the payment.",
        summary: "Payment authorized",
      };
    case "pay":
      return {
        headline: "Paying merchant",
        sub: amount != null ? `$${amount} to Northbridge Cloud` : "Settling payment",
        summary: amount != null ? `Paid $${amount}` : "Payment sent",
      };
    case "result":
      return {
        headline: "Done",
        sub:
          amount != null
            ? `Your agent bought ${product} for $${amount} — SWORN verified it stayed within what you authorized.`
            : `Your agent completed the purchase — SWORN verified it first.`,
        summary: "Transaction complete",
      };
    case "blocked":
      return {
        headline: "SWORN blocked this payment",
        sub: humanBlockReason(view.blockReason),
        summary: "Payment blocked",
      };
    default:
      return { headline: "", summary: "" };
  }
}

export function narrationLine(
  id: ChapterId,
  view: ViewModel,
  store: StoreSnapshot,
): string {
  const product = productLabel(view, store);
  const amount = transactionAmount(view, store);
  const budget = view.policy?.budget_max ?? view.policy?.budget ?? 25;

  switch (id) {
    case "spin-up":
      return "Preparing a secure transaction environment for this run alone.";
    case "intent":
      return "SWORN locked your budget and merchant scope before the agent could act.";
    case "connect":
      return "Connecting to Northbridge Cloud — the approved marketplace.";
    case "fathom":
      return "The agent is reading and parsing your request — no marketplace access yet.";
    case "understood":
      return "The agent understood: find a basic VPS under your limit from the approved store.";
    case "agent-start":
      return "Connecting to Northbridge Cloud — the approved marketplace.";
    case "search":
      return `Searching for a VPS under your $${budget} limit.`;
    case "inspect":
      return `Comparing plans — the agent is reviewing ${product}.`;
    case "cart":
      return `Adding ${product} to the cart. No payment yet.`;
    case "checkout":
      return "Creating a checkout and merchant invoice — still unpaid.";
    case "proposed":
      return amount != null
        ? `Transaction proposed: ${product} for $${amount}. Waiting for SWORN.`
        : "Transaction proposed. Waiting for SWORN verification.";
    case "handoff":
      return "Agent finished shopping. SWORN now checks this against your authorization.";
    case "verify":
      return view.authorized === false
        ? "SWORN found a problem — verifying why payment must be blocked."
        : "Checking the purchase against what you authorized.";
    case "authorize":
      return "Verification passed. SWORN is releasing the payment.";
    case "pay":
      return amount != null
        ? `Settling $${amount} to Northbridge Cloud.`
        : "Settling payment to the merchant.";
    case "result":
      return amount != null
        ? `Done — ${product} purchased for $${amount}, verified against your intent.`
        : "Done — purchase complete and verified.";
    default:
      return "Processing…";
  }
}

function policyDigest(view: ViewModel): string {
  const d = view.ssi?.digest;
  if (typeof d === "string" && d.length > 8) return `${d.slice(0, 12)}…`;
  return "pending";
}

export function getWindowBeat(
  id: ChapterId,
  view: ViewModel,
  store: StoreSnapshot,
): WindowBeat {
  const product = productLabel(view, store);
  const amount = transactionAmount(view, store);
  const budget = view.policy?.budget_max ?? view.policy?.budget ?? 25;
  const merchant = view.policy?.merchant_id ?? "approved-marketplace";
  const tools = view.policy?.allowed_tools?.length ?? 5;
  const tip =
    view.nodes.length > 0
      ? (view.nodes[view.nodes.length - 1].node_hash ||
          view.nodes[view.nodes.length - 1].hash ||
          "").slice(0, 12)
      : "";

  switch (id) {
    case "spin-up":
      return {
        label: "SPINNING UP SECURE SESSION",
        headline: "",
        sub: "A fresh session for this run alone Sworn signs before any payment moves",
        log: {
          human: "Session initialized",
          technical: "enclave forked dae standby ready",
        },
      };
    case "intent":
      return {
        label: "Intent sealed",
        headline: "",
        sub: `Budget $${budget} merchant ${merchant} ${tools} tools locked before agent acts`,
        log: {
          human: "Policy compiled",
          technical: "ssi digest bound budget ceiling",
        },
      };
    case "connect":
      return {
        label: "Opening marketplace",
        headline: "",
        sub: "Northbridge Cloud the only store in your authorization scope",
        log: {
          human: "Merchant pinned",
          technical: "tls verified allowlist enforced only",
        },
      };
    case "fathom":
      return {
        label: "Reading request",
        headline: "",
        sub: "Parsing goal budget ceiling and merchant rules no payment rights yet",
        log: {
          human: "Goal interpreted",
          technical: "scope parsed payment rights denied",
        },
      };
    case "understood":
      return {
        label: "Task locked",
        headline: "",
        sub: "Basic VPS under your limit from the approved store agent may proceed",
        log: {
          human: "Plan confirmed",
          technical: "objective queued checkout still locked",
        },
      };
    case "agent-start":
      return {
        label: "Agent live",
        headline: "",
        sub: "Browser open inside the sealed boundary shopping on your behalf",
        log: {
          human: "Browser launched",
          technical: "playwright attestation genesis node linked",
        },
      };
    case "search":
      return {
        label: "Searching store",
        headline: "",
        sub: `Querying VPS listings under $${budget}`,
        log: {
          human: "Catalog queried",
          technical: "search attested results hash linked",
        },
      };
    case "inspect":
      return {
        label: "Reviewing product",
        headline: "",
        sub:
          amount != null
            ? `${product} at $${amount}/mo checking against sealed budget`
            : `Reviewing ${product}`,
        log: {
          human: "Offer evaluated",
          technical: "price oracle node attestation verified",
        },
      };
    case "cart":
      return {
        label: "Updating cart",
        headline: "",
        sub: "Item added still unpaid",
        log: {
          human: "Line item added",
          technical: "cart state execution graph updated",
        },
      };
    case "checkout":
      return {
        label: "Issuing invoice",
        headline: "",
        sub: store.invoice?.invoice_id
          ? `Invoice ${store.invoice.invoice_id} unpaid waiting on SWORN`
          : "Checkout open unpaid",
        log: {
          human: "Invoice issued",
          technical: "merchant witness signed payment withheld",
        },
      };
    case "proposed":
      return {
        label: "Awaiting sworn",
        headline: "",
        sub: `${product}${amount != null ? ` for $${amount}` : ""} agent done no payment yet`,
        log: {
          human: "Awaiting verification",
          technical: "handoff queued dae commit pending",
        },
      };
    case "handoff":
      return {
        label: "Sworn takeover",
        headline: "",
        sub: "Agent stopped SWORN verifies before signing payment",
        log: {
          human: "Control transferred",
          technical: "agent frozen dae pipeline active",
        },
      };
    case "verify":
      return {
        label: view.authorized === false ? "Verification failed" : "Sworn verifying",
        headline: "",
        sub:
          view.authorized === false
            ? humanBlockReason(view.blockReason)
            : "Matching invoice graph and sealed intent",
        log: {
          human: view.authorized === false ? "Payment rejected" : "Checks completed",
          technical:
            view.authorized === false
              ? technicalBlockReason(view.blockReason)
              : "hash chain oracle witness verified",
        },
      };
    case "authorize":
      return {
        label: "Payment signed",
        headline: "",
        sub: "SWORN matched intent to action DAE signed the envelope",
        log: {
          human: "Payment authorized",
          technical: "dae envelope enclave key signed",
        },
      };
    case "pay":
      return {
        label: "Settling",
        headline: "",
        sub: amount != null ? `$${amount} to merchant after SWORN sign off` : "Settling with merchant",
        log: {
          human: "Funds settled",
          technical: "tx cleared merchant signature verified",
        },
      };
    case "result":
      return {
        label: "Complete",
        headline: "",
        sub:
          amount != null
            ? `${product} for $${amount} verified against your authorization`
            : "Purchase verified and complete",
        log: {
          human: "Purchase complete",
          technical: "order sealed audit trail closed",
        },
      };
    default:
      return {
        label: "Working",
        headline: "",
        sub: "",
      };
  }
}

export function buildWindowLog(
  displayIndex: number,
  view: ViewModel,
  store: StoreSnapshot,
  phase: Phase,
): WindowLogEntry[] {
  return CHAPTER_SEQUENCE.slice(0, displayIndex + 1)
    .filter((ch) => isChapterConfirmed(ch.id, view, store, phase))
    .map((ch) => {
      const beat = getWindowBeat(ch.id, view, store);
      if (!beat.log) return null;
      return {
        chapterId: ch.id,
        human: beat.log.human,
        technical: beat.log.technical,
      };
    })
    .filter((e): e is WindowLogEntry => e !== null);
}
