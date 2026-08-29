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
  whatBreaks: string;
  kind: AttackKind;
  scenario?: string;
  demoEvent?: string;
  prompt?: string;
};
