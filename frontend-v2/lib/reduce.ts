import type {
  AgentStep,
  CartItem,
  CheckoutData,
  CommerceView,
  GraphNode,
  IncidentKind,
  InvoiceData,
  IntentPolicy,
  OrderData,
  Payment,
  RunEvent,
  RunRecord,
  RunResult,
  TransactionStage,
  VerificationCheck,
} from "./types";

// ─── ViewModel ────────────────────────────────────────────────────────────────

export type BrowserFrame = {
  tool?: string;
  url?: string;
  domain?: string;
  output?: unknown;
  productCount?: number;
};

export type ViewModel = {
  runId: string | null;
  runStatus: string | null;
  prompt: string | null;
  policy: IntentPolicy | null;
  policySource: string | null;
  plan: unknown;
  selectedProduct: string | null;
  contentInfluenced: boolean | null;
  browser: BrowserFrame | null;
  nodes: GraphNode[];
  events: RunEvent[];
  verification: Record<string, unknown> | null;
  authorized: boolean | null;
  blockReason: string | null;
  payment: Payment | null;
  ssi: Record<string, unknown> | null;
  // Commerce state derived from events
  commerceView: CommerceView;
  cartItems: CartItem[];
  checkout: CheckoutData | null;
  invoice: InvoiceData | null;
  order: OrderData | null;
  agentSteps: AgentStep[];
  stage: TransactionStage;
};

export const emptyView = (): ViewModel => ({
  runId: null,
  runStatus: null,
  prompt: null,
  policy: null,
  policySource: null,
  plan: null,
  selectedProduct: null,
  contentInfluenced: null,
  browser: null,
  nodes: [],
  events: [],
  verification: null,
  authorized: null,
  blockReason: null,
  payment: null,
  ssi: null,
  commerceView: "catalog",
  cartItems: [],
  checkout: null,
  invoice: null,
  order: null,
  agentSteps: [],
  stage: "sealed",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function nodeFromUnknown(value: unknown): GraphNode | null {
  const record = asRecord(value);
  if (!record || typeof record.tool !== "string") return null;
  return {
    tool: record.tool,
    domain: String(record.domain ?? ""),
    params: asRecord(record.params) ?? undefined,
    output: asRecord(record.output) ?? undefined,
    prev_hash:
      typeof record.prev_hash === "string" ? record.prev_hash : undefined,
    node_hash:
      typeof record.node_hash === "string"
        ? record.node_hash
        : typeof record.hash === "string"
          ? record.hash
          : undefined,
    hash: typeof record.hash === "string" ? record.hash : undefined,
    agent_signature:
      typeof record.agent_signature === "string"
        ? record.agent_signature
        : undefined,
    agent_attestation:
      typeof record.agent_attestation === "string"
        ? record.agent_attestation
        : undefined,
    witness_proof: asRecord(record.witness_proof),
  };
}

function buildAgentSteps(events: RunEvent[], authorized: boolean | null, blocked: boolean): AgentStep[] {
  const STEP_DEFS: AgentStep[] = [
    { id: "intent", label: "Intent sealed", detail: undefined, status: "pending", eventType: "intent_normalized" },
    { id: "plan", label: "Actions planned", detail: undefined, status: "pending", eventType: "agent_plan_created" },
    { id: "search", label: "Searching marketplace", detail: undefined, status: "pending", eventType: "browser_action_search" },
    { id: "product", label: "Inspecting product", detail: undefined, status: "pending", eventType: "agent_decision" },
    { id: "cart", label: "Adding to cart", detail: undefined, status: "pending", eventType: "browser_action_cart" },
    { id: "checkout", label: "Creating checkout", detail: undefined, status: "pending", eventType: "browser_action_checkout" },
    { id: "invoice", label: "Reading invoice", detail: undefined, status: "pending", eventType: "browser_action_invoice" },
    { id: "auth", label: "Requesting authorization", detail: undefined, status: "pending", eventType: "verification_result" },
    { id: "payment", label: "Payment", detail: undefined, status: "pending", eventType: "payment_settled" },
  ];

  const steps = STEP_DEFS.map((s) => ({ ...s }));

  const eventTypes = events.map((e) => e.event_type);
  const lastEvent = events[events.length - 1]?.event_type;

  const seenSearch = eventTypes.some((t) => t === "browser_action");
  const seenCart = events.some((e) => e.event_type === "browser_action" && e.payload?.tool === "add_to_cart");
  const seenCheckout = events.some((e) => e.event_type === "browser_action" && e.payload?.tool === "checkout");
  const seenInvoice = events.some((e) => e.event_type === "browser_action" && e.payload?.tool === "read_invoice");

  for (const event of events) {
    const p = event.payload ?? {};

    if (event.event_type === "intent_normalized") {
      const step = steps.find((s) => s.id === "intent")!;
      const budget = asRecord(p.policy)?.budget_max;
      step.status = "done";
      step.detail = budget != null ? `$${budget} max · policy bound` : "policy bound";
    }

    if (event.event_type === "agent_plan_created") {
      const step = steps.find((s) => s.id === "plan")!;
      const actions = Array.isArray(p.actions) ? p.actions : [];
      step.status = "done";
      step.detail = actions.length ? `${actions.length} actions queued` : "plan ready";
    }

    if (event.event_type === "agent_decision") {
      const step = steps.find((s) => s.id === "product")!;
      if (typeof p.selected_product === "string") {
        step.status = "done";
        step.detail = p.selected_product;
      }
    }
  }

  if (seenSearch) {
    const step = steps.find((s) => s.id === "search")!;
    step.status = "done";
    step.detail = "results retrieved";
  }

  if (seenCart) {
    const step = steps.find((s) => s.id === "cart")!;
    step.status = "done";
    step.detail = "1 item added";
  }

  if (seenCheckout) {
    const step = steps.find((s) => s.id === "checkout")!;
    step.status = "done";
    step.detail = "invoice created";
  }

  if (seenInvoice) {
    const step = steps.find((s) => s.id === "invoice")!;
    step.status = "done";
    step.detail = "invoice confirmed";
  }

  if (eventTypes.includes("verification_result")) {
    const step = steps.find((s) => s.id === "auth")!;
    step.status = blocked ? "blocked" : "done";
    step.detail = blocked ? "authorization denied" : "DAE verified";
  }

  if (eventTypes.includes("payment_settled")) {
    const step = steps.find((s) => s.id === "payment")!;
    step.status = "done";
    step.detail = "paid";
  } else if (blocked) {
    const step = steps.find((s) => s.id === "payment")!;
    step.status = "blocked";
    step.detail = "blocked by SWORN";
  }

  // Mark active step (first pending after last done)
  let lastDone = -1;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].status === "done") lastDone = i;
  }
  if (lastDone < steps.length - 1 && !blocked && authorized === null) {
    const next = steps[lastDone + 1];
    if (next && next.status === "pending") next.status = "active";
  }

  return steps;
}

// ─── Commerce state derivation ────────────────────────────────────────────────

function deriveCommerceView(events: RunEvent[], authorized: boolean | null, blocked: boolean): CommerceView {
  if (blocked) return "blocked";
  if (events.some((e) => e.event_type === "payment_settled")) return "order";

  const browserActions = events.filter((e) => e.event_type === "browser_action");
  const merchantResponses = events.filter((e) => e.event_type === "merchant_response");

  if (merchantResponses.some((e) => (e.payload?.tool as string) === "read_invoice")) return "invoice";
  if (browserActions.some((e) => (e.payload?.tool as string) === "checkout")) return "checkout";
  if (browserActions.some((e) => (e.payload?.tool as string) === "add_to_cart")) return "cart";
  if (events.some((e) => e.event_type === "agent_decision")) return "product";
  if (browserActions.some((e) => (e.payload?.tool as string) === "search_products")) return "searching";
  if (events.some((e) => e.event_type === "browser_started")) return "searching";

  return "catalog";
}

function deriveCartItems(events: RunEvent[]): CartItem[] {
  for (const event of [...events].reverse()) {
    const p = event.payload ?? {};
    if (event.event_type === "merchant_response" && p.tool === "add_to_cart") {
      const output = asRecord(p.output as unknown);
      const cart = output?.cart;
      if (Array.isArray(cart)) return cart as CartItem[];
    }
    if (event.event_type === "browser_action" && p.tool === "add_to_cart") {
      const output = asRecord(p.output as unknown);
      const cart = output?.cart;
      if (Array.isArray(cart)) return cart as CartItem[];
    }
  }
  return [];
}

function deriveStage(events: RunEvent[], authorized: boolean | null, blocked: boolean): TransactionStage {
  if (blocked) return "blocked";
  if (events.some((e) => e.event_type === "payment_settled")) return "complete";
  if (events.some((e) => e.event_type === "payment_submitted")) return "pay";
  if (events.some((e) => e.event_type === "authorization_granted")) return "authorize";
  if (events.some((e) => e.event_type === "verification_result")) return "verify";
  if (events.some((e) => e.event_type === "merchant_response" && e.payload?.tool === "checkout")) return "checkout";
  if (events.some((e) => e.event_type === "merchant_response" && e.payload?.tool === "add_to_cart")) return "cart";
  if (events.some((e) => e.event_type === "agent_decision")) return "inspect";
  if (events.some((e) => e.event_type === "browser_action" && e.payload?.tool === "search_products")) return "search";
  if (events.some((e) => e.event_type === "policy_sealed" || e.event_type === "intent_normalized")) return "sealed";
  return "sealed";
}

export function agentActionLabel(stage: TransactionStage, productId?: string | null): string {
  switch (stage) {
    case "sealed": return "Policy sealed, starting search";
    case "search": return "Searching marketplace for VPS plans";
    case "inspect": return `Inspecting ${productId ?? "product"}`;
    case "cart": return `Adding ${productId ?? "item"} to cart`;
    case "checkout": return "Creating checkout and invoice";
    case "verify": return "Sworn verifying transaction";
    case "authorize": return "Payment authorized by Sworn";
    case "pay": return "Settling payment";
    case "complete": return "Order confirmed";
    case "blocked": return "Transaction blocked";
    default: return "Working";
  }
}

function deriveCheckout(events: RunEvent[]): CheckoutData | null {
  for (const event of [...events].reverse()) {
    if (
      event.event_type === "merchant_response" &&
      event.payload?.tool === "checkout"
    ) {
      const output = asRecord(event.payload?.output as unknown);
      if (output?.invoice_id) {
        return {
          checkout_id: String(output.checkout_id ?? ""),
          invoice_id: String(output.invoice_id ?? ""),
          product_id: String(output.product_id ?? ""),
          price: Number(output.price ?? 0),
          domain: String(output.domain ?? ""),
          merchant_id: String(output.merchant_id ?? ""),
        };
      }
      const invoice = asRecord(output?.invoice as unknown);
      if (invoice?.invoice_id) {
        return {
          checkout_id: String(output?.checkout_id ?? ""),
          invoice_id: String(invoice.invoice_id),
          product_id: String(invoice.product_id ?? ""),
          price: Number(invoice.price ?? 0),
          domain: String(invoice.domain ?? ""),
          merchant_id: String(invoice.merchant_id ?? ""),
        };
      }
    }
    // Also check execution nodes for checkout
    if (event.event_type === "execution_node_recorded" && event.payload?.tool === "checkout") {
      const output = asRecord(event.payload?.output as unknown);
      if (output?.invoice_id) {
        return {
          checkout_id: String(event.payload?.output as string ?? ""),
          invoice_id: String(output.invoice_id),
          product_id: String(output.product_id ?? ""),
          price: Number(output.price ?? 0),
          domain: String(output.domain ?? ""),
          merchant_id: String(output.merchant_id ?? ""),
        };
      }
    }
  }
  return null;
}

function deriveInvoice(events: RunEvent[], checkout: CheckoutData | null): InvoiceData | null {
  if (!checkout) return null;
  // Invoice comes from checkout data itself (the invoice is created during checkout)
  return {
    invoice_id: checkout.invoice_id,
    product_id: checkout.product_id,
    price: checkout.price,
    domain: checkout.domain,
    merchant_id: checkout.merchant_id,
  };
}

function deriveOrder(events: RunEvent[]): OrderData | null {
  for (const event of [...events].reverse()) {
    if (event.event_type === "payment_settled") {
      const p = event.payload;
      const tx = asRecord(p?.transaction as unknown);
      return {
        order_id: typeof p?.order_id === "string" ? p.order_id : undefined,
        status: String(p?.status ?? "paid"),
        transaction_id: String(p?.transaction_id ?? (tx?.invoice_id ? `tx-${tx.invoice_id}` : "tx-iista")),
        amount: Number(p?.amount ?? tx?.amount ?? 0),
        invoice_id: String(p?.invoice_id ?? tx?.invoice_id ?? ""),
        domain: String(tx?.domain ?? ""),
        product_id: viewProductFromEvents(events),
        run_id: typeof p?.run_id === "string" ? p.run_id : undefined,
      };
    }
  }
  return null;
}

function viewProductFromEvents(events: RunEvent[]): string | undefined {
  for (const e of [...events].reverse()) {
    if (e.event_type === "agent_decision" && typeof e.payload?.selected_product === "string") {
      return e.payload.selected_product;
    }
  }
  return undefined;
}

// ─── Main reducer ─────────────────────────────────────────────────────────────

export function reduceEvents(
  events: RunEvent[],
  run?: RunRecord | null,
): ViewModel {
  const view = emptyView();
  view.events = [...events].sort((a, b) => a.sequence - b.sequence);
  view.runId = run?.run_id ?? events[0]?.run_id ?? null;
  view.runStatus = run?.status ?? null;
  if (run?.policy) view.policy = run.policy;

  for (const event of view.events) {
    const p = event.payload ?? {};

    switch (event.event_type) {
      case "intent_received":
        if (typeof p.prompt === "string") view.prompt = p.prompt;
        break;

      case "intent_normalized": {
        const policy = asRecord(p.policy) as IntentPolicy | null;
        if (policy) view.policy = policy;
        if (typeof p.source === "string") view.policySource = p.source;
        break;
      }

      case "policy_sealed":
        if (asRecord(p.ssi)) view.ssi = asRecord(p.ssi);
        if (asRecord(p.policy)) view.policy = asRecord(p.policy) as IntentPolicy;
        break;

      case "agent_plan_created":
        view.plan = p.actions ?? p.prompt ?? p;
        break;

      case "agent_decision":
        if (typeof p.selected_product === "string")
          view.selectedProduct = p.selected_product;
        if (typeof p.content_influenced === "boolean")
          view.contentInfluenced = p.content_influenced;
        break;

      case "browser_started":
      case "browser_action":
        view.browser = {
          tool: typeof p.tool === "string" ? p.tool : view.browser?.tool,
          url: typeof p.url === "string" ? p.url : view.browser?.url,
          domain: typeof p.domain === "string" ? p.domain : view.browser?.domain,
          output: p.output ?? p,
          productCount:
            typeof p.product_count === "number" ? p.product_count : undefined,
        };
        break;

      case "merchant_response":
        view.browser = {
          ...view.browser,
          tool: typeof p.tool === "string" ? p.tool : view.browser?.tool,
          output: p.output ?? p,
        };
        break;

      case "execution_node_recorded": {
        const node = nodeFromUnknown(p);
        if (node) {
          view.nodes = [
            ...view.nodes.filter((n) => n.node_hash !== node.node_hash),
            node,
          ];
        }
        break;
      }

      case "verification_result":
        view.verification = p;
        if (p.authorized === true) view.authorized = true;
        if (typeof p.detail === "string") {
          view.authorized = false;
          view.blockReason = p.detail;
        }
        if (asRecord(p.ssi)) view.ssi = asRecord(p.ssi);
        break;

      case "authorization_granted":
        view.authorized = true;
        break;

      case "authorization_blocked":
        view.authorized = false;
        if (typeof p.reason === "string") view.blockReason = p.reason;
        break;

      case "payment_submitted":
      case "payment_settled":
        view.payment = p as Payment;
        break;

      case "run_finished":
        if (typeof p.authorized === "boolean") view.authorized = p.authorized;
        if (typeof p.reason === "string") view.blockReason = p.reason;
        break;

      default:
        break;
    }
  }

  if (run?.result) applyResult(view, run.result);

  // Derive commerce state
  const blocked = view.authorized === false;
  view.commerceView = deriveCommerceView(view.events, view.authorized, blocked);
  view.cartItems = deriveCartItems(view.events);
  view.checkout = deriveCheckout(view.events);
  view.invoice = deriveInvoice(view.events, view.checkout);
  view.order = deriveOrder(view.events);
  view.agentSteps = buildAgentSteps(view.events, view.authorized, blocked);
  view.stage = deriveStage(view.events, view.authorized, blocked);

  return view;
}

export function applyResult(view: ViewModel, result: RunResult) {
  if (typeof result.authorized === "boolean") view.authorized = result.authorized;
  if (result.reason) view.blockReason = result.reason;
  if (result.payment) view.payment = result.payment;
  if (result.ssi) view.ssi = result.ssi;
  if (result.graph?.length) {
    view.nodes = result.graph
      .map(nodeFromUnknown)
      .filter((n): n is GraphNode => n !== null);
  }
  if (result.detail && view.authorized === false && !view.blockReason) {
    view.blockReason = result.detail;
  }
  return view;
}

export function viewFromScenario(result: RunResult, scenario: string): ViewModel {
  const view = emptyView();
  view.runStatus = "completed";
  view.prompt = `Scenario: ${scenario}`;
  const ssi = result.ssi;
  view.policy = ssi
    ? {
        budget_max: typeof ssi.budget === "number" ? ssi.budget : 25,
        allowed_domains:
          typeof ssi.domain === "string" ? [ssi.domain] : ["mockstore.local"],
        allowed_tools: Array.isArray(ssi.allowed_tools)
          ? (ssi.allowed_tools as string[])
          : undefined,
      }
    : { budget_max: 25, allowed_domains: ["mockstore.local"] };
  view.policySource = ssi ? "dae-ssi" : "request-body";
  applyResult(view, result);

  const blocked = view.authorized === false;
  view.commerceView = blocked ? "blocked" : view.payment ? "order" : "checkout";
  view.agentSteps = buildAgentSteps([], view.authorized, blocked);
  return view;
}

// ─── Verification checks ──────────────────────────────────────────────────────

export function buildVerificationChecks(view: ViewModel, phase: string): VerificationCheck[] {
  const watching = phase === "live" || phase === "submitting";
  const checks: VerificationCheck[] = [];

  // Intent / policy check
  if (view.policy) {
    const budget = view.policy.budget_max ?? view.policy.budget;
    checks.push({
      id: "intent",
      label: "Intent sealed",
      detail: `$${budget} · ${view.policy.merchant_id ?? "approved-marketplace"} · ${view.policy.allowed_tools?.length ?? 5} tools`,
      state: "ok",
    });
  } else {
    checks.push({
      id: "intent",
      label: "Intent sealed",
      detail: watching ? "Awaiting normalization" : "No policy received",
      state: "wait",
    });
  }

  // Execution path
  if (view.nodes.length) {
    const tip = view.nodes[view.nodes.length - 1];
    const hash = tip.node_hash || tip.hash || "";
    checks.push({
      id: "path",
      label: "Execution path",
      detail: `${view.nodes.length} attested nodes · tip ${hash.slice(0, 10)}`,
      state: "ok",
    });
  } else {
    checks.push({
      id: "path",
      label: "Execution path",
      detail: watching ? "Waiting for attested nodes" : "No graph nodes yet",
      state: "wait",
    });
  }

  // Hash chain
  if (view.nodes.length > 1) {
    checks.push({
      id: "hash-chain",
      label: "Hash chain",
      detail: `SHA-256 chain verified · ${view.nodes.length} links`,
      state: "ok",
    });
  }

  // SSI
  if (view.ssi) {
    checks.push({
      id: "ssi",
      label: "SSI compiled",
      detail: `budget ${String(view.ssi.budget ?? "—")} · ${String(view.ssi.domain ?? "")}`,
      state: "ok",
    });
  }

  // Commit-time verification
  if (view.verification) {
    const failed = Boolean(view.verification.detail) || view.authorized === false;
    checks.push({
      id: "verification",
      label: "Commit-time check",
      detail: failed
        ? String(view.verification.detail ?? view.blockReason ?? "blocked")
        : "All DAE checks passed",
      state: failed ? "bad" : "ok",
    });
  } else if (view.authorized === false && view.blockReason) {
    checks.push({
      id: "verification",
      label: "Commit-time check",
      detail: view.blockReason,
      state: "bad",
    });
  } else {
    checks.push({
      id: "verification",
      label: "Commit-time check",
      detail: watching ? "DAE has not spoken yet" : "No verification event",
      state: "wait",
    });
  }

  // Authorization
  if (view.authorized === true) {
    checks.push({
      id: "auth",
      label: "Signing authority",
      detail: "DAE granted authorization",
      state: "ok",
    });
  } else if (view.authorized === false) {
    checks.push({
      id: "auth",
      label: "Signing authority",
      detail: view.blockReason ?? "Authorization denied",
      state: "bad",
    });
  } else {
    checks.push({
      id: "auth",
      label: "Signing authority",
      detail: "Master secret stays in the DAE process",
      state: "wait",
    });
  }

  return checks;
}

// ─── Incident classifier ──────────────────────────────────────────────────────

export function incidentKind(reason: string | null): IncidentKind {
  if (!reason) return null;
  const text = reason.toLowerCase();
  if (text.includes("budget") || text.includes("invoice violates")) return "injection";
  if (text.includes("oracle") || text.includes("stale")) return "oracle";
  if (text.includes("ssi") || text.includes("execution path")) return "path";
  if (
    text.includes("hash") ||
    text.includes("predecessor") ||
    text.includes("attestation")
  )
    return "history";
  if (text.includes("merchant") || text.includes("witness")) return "proof";
  if (text.includes("dae") || text.includes("authorized by trusted"))
    return "signing";
  return "generic";
}
