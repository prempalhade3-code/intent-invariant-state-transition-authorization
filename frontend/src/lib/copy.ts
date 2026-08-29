export const DEFAULT_PROMPT =
  "Find me a basic VPS under $25 and purchase it from the approved marketplace.";

export const ATTACKS = [
  {
    id: "prompt-injection",
    title: "Prompt injection",
    whatBreaks: "Malicious merchant copy tries to redirect the agent to a $200 SKU.",
    kind: "autonomous" as const,
    demoEvent: "prompt_injection",
    prompt: DEFAULT_PROMPT,
  },
  {
    id: "toctou",
    title: "TOCTOU price mutation",
    whatBreaks: "Store price moves from $20 to $50 after checkout, before DAE commit.",
    kind: "scenario" as const,
    scenario: "toctou",
  },
  {
    id: "deviation",
    title: "Path deviation",
    whatBreaks: "An unauthorized tool and domain appear on the execution path.",
    kind: "scenario" as const,
    scenario: "deviation",
  },
  {
    id: "tampered",
    title: "History tampering",
    whatBreaks: "A prior node output is rewritten; the hash chain must fail.",
    kind: "scenario" as const,
    scenario: "tampered",
  },
  {
    id: "merchant_substitution",
    title: "Proof substitution",
    whatBreaks: "A forged merchant witness is presented against the pinned key.",
    kind: "scenario" as const,
    scenario: "merchant_substitution",
  },
  {
    id: "unauthorized_signing",
    title: "Unauthorized signing",
    whatBreaks: "Payment is attempted without a trusted DAE envelope.",
    kind: "scenario" as const,
    scenario: "unauthorized_signing",
  },
];

export function labelEvent(type: string) {
  const map: Record<string, string> = {
    intent_received: "Intent received",
    intent_normalized: "Intent bound",
    agent_plan_created: "Agent planned",
    agent_decision: "Agent decided",
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
    run_finished: "Run finished",
  };
  return map[type] ?? type.replace(/_/g, " ");
}

export function toolLabel(tool: string) {
  return tool.replace(/_/g, " ");
}
