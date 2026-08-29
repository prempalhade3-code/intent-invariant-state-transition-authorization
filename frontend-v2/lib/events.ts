import type { RunEvent } from "./types";

// ─── Human-readable event labels ──────────────────────────────────────────────

const EVENT_LABELS: Record<string, string> = {
  intent_received: "Intent received",
  intent_normalized: "Intent bound to policy",
  agent_plan_created: "Agent planned actions",
  agent_decision: "Agent selected product",
  browser_started: "Browser opened",
  browser_action: "Browser acted",
  merchant_response: "Merchant responded",
  state_transition: "State transitioned",
  execution_node_recorded: "Node attested",
  verification_result: "DAE verified",
  authorization_granted: "Authorization granted",
  authorization_blocked: "Authorization blocked",
  payment_submitted: "Payment submitted",
  payment_settled: "Payment settled",
  run_finished: "Run complete",
};

export function labelEvent(type: string): string {
  return EVENT_LABELS[type] ?? type.replace(/_/g, " ");
}

// ─── Source labels ────────────────────────────────────────────────────────────

export function labelSource(source: string): string {
  const map: Record<string, string> = {
    gateway: "Gateway",
    agent: "Agent",
    browser: "Browser",
    store: "Store",
    dae: "DAE",
  };
  return map[source] ?? source;
}

// ─── Tool labels ──────────────────────────────────────────────────────────────

export function labelTool(tool: string): string {
  const map: Record<string, string> = {
    search_products: "Search",
    view_product: "View product",
    add_to_cart: "Add to cart",
    checkout: "Checkout",
    read_invoice: "Read invoice",
    unauthorized_api: "Unauthorized API call",
  };
  return map[tool] ?? tool.replace(/_/g, " ");
}

// ─── Event narrative (what just happened, human language) ─────────────────────

export function eventNarrative(event: RunEvent): string {
  const p = event.payload ?? {};

  switch (event.event_type) {
    case "intent_received":
      return typeof p.prompt === "string" ? `"${p.prompt.slice(0, 80)}"` : "Intent received";

    case "intent_normalized": {
      const pol = p.policy as Record<string, unknown> | null;
      const budget = pol?.budget_max ?? pol?.budget;
      const merchant = pol?.merchant_id;
      if (budget !== undefined) return `Policy bound — $${budget} max · ${merchant ?? "approved marketplace"}`;
      return "Intent normalized and bound";
    }

    case "agent_plan_created": {
      const actions = Array.isArray(p.actions) ? p.actions : [];
      return actions.length
        ? `${actions.length} actions queued: ${actions.join(" → ")}`
        : "Agent plan created";
    }

    case "agent_decision":
      if (typeof p.selected_product === "string") {
        const influenced = p.content_influenced === true;
        return `Selected ${p.selected_product}${influenced ? " — influenced by merchant content" : ""}`;
      }
      return "Agent made a decision";

    case "browser_started":
      return `Browser opened${typeof p.url === "string" ? ` at ${p.url}` : ""}`;

    case "browser_action": {
      const tool = typeof p.tool === "string" ? labelTool(p.tool) : "action";
      const domain = typeof p.domain === "string" ? p.domain : "";
      return `${tool}${domain ? ` on ${domain}` : ""}`;
    }

    case "merchant_response": {
      const tool = typeof p.tool === "string" ? labelTool(p.tool) : "response";
      return `Merchant responded to ${tool}`;
    }

    case "execution_node_recorded": {
      const tool = typeof p.tool === "string" ? labelTool(p.tool) : "node";
      return `${tool} attested and recorded`;
    }

    case "verification_result":
      if (typeof p.detail === "string") return `Verification failed — ${p.detail}`;
      return "DAE verification passed";

    case "authorization_granted":
      return "DAE authorized the transaction";

    case "authorization_blocked":
      return typeof p.reason === "string"
        ? `SWORN blocked — ${p.reason}`
        : "Transaction blocked by SWORN";

    case "payment_submitted":
      return "Payment submitted to merchant";

    case "payment_settled": {
      const amount = p.amount ?? (p as Record<string, unknown>)?.transaction;
      return `Payment settled${amount !== undefined ? ` · $${amount}` : ""}`;
    }

    case "run_finished":
      return p.authorized === true ? "Run complete — transaction authorized" : "Run complete — transaction blocked";

    default:
      return labelEvent(event.event_type);
  }
}

// ─── Source color classes ─────────────────────────────────────────────────────

export function sourceColor(source: string): string {
  const map: Record<string, string> = {
    gateway: "text-ink-muted",
    agent: "text-accent",
    browser: "text-warning",
    store: "text-ink-muted",
    dae: "text-accent-dark",
  };
  return map[source] ?? "text-ink-faint";
}

// ─── Event significance ───────────────────────────────────────────────────────

export function isSignificantEvent(event: RunEvent): boolean {
  const significant = new Set([
    "intent_normalized",
    "agent_decision",
    "execution_node_recorded",
    "verification_result",
    "authorization_granted",
    "authorization_blocked",
    "payment_settled",
    "run_finished",
  ]);
  return significant.has(event.event_type);
}
