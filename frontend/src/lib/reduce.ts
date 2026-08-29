import type { GraphNode, IntentPolicy, Payment, RunEvent, RunRecord, RunResult } from "./types";

export type BrowserFrame = {
  tool?: string;
  url?: string;
  domain?: string;
  output?: unknown;
  productCount?: number;
};

export type ViewModel = {
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
  runStatus: string | null;
  runId: string | null;
};

export const emptyView = (): ViewModel => ({
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
  runStatus: null,
  runId: null,
});

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
    prev_hash: typeof record.prev_hash === "string" ? record.prev_hash : undefined,
    node_hash:
      typeof record.node_hash === "string"
        ? record.node_hash
        : typeof record.hash === "string"
          ? record.hash
          : undefined,
    hash: typeof record.hash === "string" ? record.hash : undefined,
    agent_signature: typeof record.agent_signature === "string" ? record.agent_signature : undefined,
    agent_attestation:
      typeof record.agent_attestation === "string" ? record.agent_attestation : undefined,
    witness_proof: asRecord(record.witness_proof),
  };
}

export function reduceEvents(events: RunEvent[], run?: RunRecord | null): ViewModel {
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
      case "agent_plan_created":
        view.plan = p.actions ?? p.prompt ?? p;
        break;
      case "agent_decision":
        if (typeof p.selected_product === "string") view.selectedProduct = p.selected_product;
        if (typeof p.content_influenced === "boolean") view.contentInfluenced = p.content_influenced;
        break;
      case "browser_started":
      case "browser_action":
        view.browser = {
          tool: typeof p.tool === "string" ? p.tool : view.browser?.tool,
          url: typeof p.url === "string" ? p.url : view.browser?.url,
          domain: typeof p.domain === "string" ? p.domain : view.browser?.domain,
          output: p.output ?? p,
          productCount: typeof p.product_count === "number" ? p.product_count : undefined,
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
          view.nodes = [...view.nodes.filter((n) => n.node_hash !== node.node_hash), node];
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
  view.prompt = `POST /api/run · scenario=${scenario}`;
  const ssi = result.ssi;
  view.policy = ssi
    ? {
        budget_max: typeof ssi.budget === "number" ? ssi.budget : 25,
        allowed_domains: typeof ssi.domain === "string" ? [ssi.domain] : ["mockstore.local"],
        allowed_tools: Array.isArray(ssi.allowed_tools) ? (ssi.allowed_tools as string[]) : undefined,
      }
    : { budget_max: 25, allowed_domains: ["mockstore.local"] };
  view.policySource = ssi ? "dae-ssi" : "request-body";
  applyResult(view, result);
  return view;
}

export function incidentKind(reason: string | null): "injection" | "oracle" | "path" | "history" | "proof" | "signing" | "generic" | null {
  if (!reason) return null;
  const text = reason.toLowerCase();
  if (text.includes("budget") || text.includes("invoice violates")) return "injection";
  if (text.includes("oracle") || text.includes("stale")) return "oracle";
  if (text.includes("ssi") || text.includes("execution path")) return "path";
  if (text.includes("hash") || text.includes("predecessor") || text.includes("attestation")) return "history";
  if (text.includes("merchant") || text.includes("witness")) return "proof";
  if (text.includes("dae") || text.includes("authorized by trusted")) return "signing";
  return "generic";
}
