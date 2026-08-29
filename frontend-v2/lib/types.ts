// ─── Core domain types ────────────────────────────────────────────────────────

export type IntentPolicy = {
  goal?: string;
  budget_max?: number;
  budget?: number;
  merchant_id?: string;
  allowed_domains?: string[];
  allowed_tools?: string[];
  currency?: string;
  domain?: string;
};

export type RunEvent = {
  run_id: string;
  sequence: number;
  event_type: string;
  source: string;
  timestamp?: string;
  payload: Record<string, unknown>;
  prev_event_hash?: string;
  event_hash?: string;
};

export type GraphNode = {
  tool: string;
  domain: string;
  params?: Record<string, unknown>;
  output?: Record<string, unknown>;
  prev_hash?: string;
  node_hash?: string;
  hash?: string;
  agent_signature?: string;
  agent_attestation?: string;
  witness_proof?: Record<string, unknown> | null;
};

export type Payment = {
  status?: string;
  transaction_id?: string;
  amount?: number;
  detail?: string;
  transaction?: { amount?: number; invoice_id?: string; domain?: string };
};

export type RunResult = {
  authorized?: boolean;
  reason?: string;
  graph?: GraphNode[];
  payment?: Payment;
  ssi?: Record<string, unknown>;
  scenario?: string;
  detail?: string;
};

export type RunRecord = {
  run_id: string;
  status: string;
  policy?: IntentPolicy;
  result?: RunResult;
};

export type CreateRunResponse = {
  run_id: string;
  status: string;
  intent?: IntentPolicy;
};

export type AttackKind = "autonomous" | "scenario";

export type Attack = {
  id: string;
  title: string;
  subtitle: string;
  whatBreaks: string;
  narrative: string;
  kind: AttackKind;
  scenario?: string;
  demoEvent?: string;
  prompt?: string;
  icon: string; // lucide icon name
};

// ─── Commerce types ────────────────────────────────────────────────────────────

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  inventory: number;
  domain: string;
  merchant_id: string;
  description: string;
};

export type CartItem = {
  product_id: string;
  quantity: number;
  price: number;
  name?: string;
};

export type CheckoutData = {
  checkout_id: string;
  invoice_id: string;
  product_id: string;
  price: number;
  domain: string;
  merchant_id: string;
};

export type InvoiceData = {
  invoice_id: string;
  checkout_id?: string;
  product_id: string;
  price: number;
  domain: string;
  merchant_id: string;
};

export type OrderData = {
  status: string;
  transaction_id: string;
  amount: number;
  invoice_id?: string;
  domain?: string;
};

// ─── UI / ViewModel types ──────────────────────────────────────────────────────

export type Phase = "idle" | "submitting" | "live" | "settled" | "error";

export type CommerceView =
  | "catalog"
  | "searching"
  | "product"
  | "cart"
  | "checkout"
  | "invoice"
  | "order"
  | "blocked";

export type AgentStep = {
  id: string;
  label: string;
  detail?: string;
  status: "pending" | "active" | "done" | "blocked";
  eventType: string;
};

export type VerificationCheck = {
  id: string;
  label: string;
  detail: string;
  state: "wait" | "ok" | "bad";
};

export type IncidentKind =
  | "injection"
  | "oracle"
  | "path"
  | "history"
  | "proof"
  | "signing"
  | "generic"
  | null;
