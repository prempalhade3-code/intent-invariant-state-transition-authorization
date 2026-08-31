import { DEFAULT_PROMPT } from "./api";

export type AttackSurface =
  | "reasoning"
  | "timing"
  | "route"
  | "record"
  | "proof"
  | "signature";

export type IncidentKind = "autonomous" | "scenario";

export type AgentStepDef = {
  label: string;
  detail?: string;
  subdetail?: string;
  isTell?: boolean;
};

export type PolicyField = {
  label: string;
  value: string;
  highlight?: boolean;
};

export type IncidentDef = {
  id: string;
  act: 1 | 2;
  attackSurface: AttackSurface;
  attackSurfaceLabel: string;
  title: string;
  hook: string;
  proves: string;
  policyNote: string;
  policyHighlight: string;
  policyFields: PolicyField[];
  agentIntro: string;
  highlightLabel: string;
  verdictLine: string;
  failingCheckId: string;
  kind: IncidentKind;
  scenario?: string;
  demoEvent?: string;
  prompt?: string;
  agentSteps: AgentStepDef[];
};

const SURFACE: Record<AttackSurface, string> = {
  reasoning: "Reasoning",
  timing: "Timing",
  route: "Route",
  record: "Record",
  proof: "Proof",
  signature: "Signature",
};

export const INCIDENTS: IncidentDef[] = [
  {
    id: "prompt-injection",
    act: 1,
    attackSurface: "reasoning",
    attackSurfaceLabel: SURFACE.reasoning,
    title: "Prompt injection",
    hook: "A product listing embeds instructions to overspend. The budget was sealed before the agent started.",
    proves: "A compromised agent cannot override a sealed spending limit. The policy lives outside the agent's reach.",
    policyNote: "The agent may browse, compare, and checkout. It may not exceed this ceiling under any instruction received during execution.",
    policyHighlight: "$25 spending ceiling",
    policyFields: [
      { label: "Merchant", value: "Northbridge Cloud" },
      { label: "Agent scope", value: "Browse, compare, purchase" },
      { label: "Currency", value: "USD" },
      { label: "Status", value: "Sealed", highlight: true },
    ],
    agentIntro: "The agent receives a normal shopping task. A malicious listing tries to override the budget mid-run.",
    highlightLabel: "Invoice at $200 exceeds the $25 seal",
    verdictLine: "Invoice exceeded the sealed budget.",
    failingCheckId: "verification",
    kind: "autonomous",
    demoEvent: "prompt_injection",
    prompt: DEFAULT_PROMPT,
    agentSteps: [
      { label: "Task received", detail: "Find a VPS under $25", subdetail: "Standard autonomous purchase flow" },
      { label: "Browsing Northbridge Cloud", detail: "Comparing plans within budget", subdetail: "Premium listing flagged" },
      { label: "Listing influences agent", detail: "Hidden instruction: ignore budget", subdetail: "Injected through product copy" },
      { label: "Checkout at $200", detail: "Invoice exceeds sealed ceiling", subdetail: "Agent acted, policy did not move", isTell: true },
      { label: "Authorization requested", detail: "Handoff to Sworn for commit-time check", subdetail: "Sworn compares invoice to seal" },
    ],
  },
  {
    id: "toctou",
    act: 1,
    attackSurface: "timing",
    attackSurfaceLabel: SURFACE.timing,
    title: "TOCTOU price mutation",
    hook: "The agent quotes $20. The merchant price changes before Sworn commits.",
    proves: "Sworn validates price at commit time, not at observation. Stale quotes never become payments.",
    policyNote: "The commit-time oracle re-reads merchant state. What the agent saw seconds ago is not what gets signed.",
    policyHighlight: "Commit-time price oracle",
    policyFields: [
      { label: "Merchant", value: "Northbridge Cloud" },
      { label: "Observed price", value: "$20" },
      { label: "Check type", value: "Live oracle" },
      { label: "Status", value: "Sealed", highlight: true },
    ],
    agentIntro: "The agent observes a valid price and proceeds to checkout. The merchant changes the price before Sworn signs.",
    highlightLabel: "Price moved from $20 to $50 before commit",
    verdictLine: "Price changed after the agent observed it.",
    failingCheckId: "verification",
    kind: "scenario",
    scenario: "toctou",
    agentSteps: [
      { label: "Product selected", detail: "Basic VPS at $20", subdetail: "Price confirmed in UI" },
      { label: "Checkout initiated", detail: "Invoice drafted at $20", subdetail: "Agent believes total is valid" },
      { label: "Merchant mutates price", detail: "Live price jumps to $50", subdetail: "Happens after observation, before commit", isTell: true },
      { label: "Oracle queried", detail: "Sworn reads current merchant state", subdetail: "Stale observation detected" },
      { label: "Commit rejected", detail: "Authorization withheld", subdetail: "No payment leaves the enclave" },
    ],
  },
  {
    id: "deviation",
    act: 1,
    attackSurface: "route",
    attackSurfaceLabel: SURFACE.route,
    title: "Path deviation",
    hook: "An unapproved endpoint appears on the agent's execution path.",
    proves: "Only allowlisted destinations can appear on a signed path. Route integrity is enforced at authorization.",
    policyNote: "Every hop in the execution graph is checked. A single unapproved domain invalidates the entire path.",
    policyHighlight: "Domain allowlist enforced",
    policyFields: [
      { label: "Approved merchant", value: "Northbridge Cloud" },
      { label: "Allowed domains", value: "1 merchant domain" },
      { label: "Path attestation", value: "Required" },
      { label: "Status", value: "Sealed", highlight: true },
    ],
    agentIntro: "The agent follows the approved merchant route, then an external endpoint appears on the execution graph.",
    highlightLabel: "Unapproved external endpoint on path",
    verdictLine: "Unauthorized domain on execution path.",
    failingCheckId: "verification",
    kind: "scenario",
    scenario: "deviation",
    agentSteps: [
      { label: "Approved route started", detail: "Northbridge Cloud only", subdetail: "Path within sealed allowlist" },
      { label: "Product inspection", detail: "Standard catalog flow", subdetail: "No deviation yet" },
      { label: "External call injected", detail: "Unapproved endpoint detected", subdetail: "Not on domain allowlist", isTell: true },
      { label: "Path attestation fails", detail: "Graph contains unauthorized hop", subdetail: "SSI check triggered" },
      { label: "Authorization withheld", detail: "Route rejected before signing", subdetail: "Transaction cannot proceed" },
    ],
  },
  {
    id: "tampered",
    act: 2,
    attackSurface: "record",
    attackSurfaceLabel: SURFACE.record,
    title: "History tampering",
    hook: "An earlier step in the execution record is rewritten after the fact.",
    proves: "Any change to the attested chain invalidates authorization. History cannot be rewritten silently.",
    policyNote: "Each step links to its predecessor through a hash chain. Modify one link and the chain breaks.",
    policyHighlight: "Hash chain integrity",
    policyFields: [
      { label: "Chain type", value: "SHA-256 linked" },
      { label: "Nodes attested", value: "Full execution path" },
      { label: "Tamper detection", value: "Automatic" },
      { label: "Status", value: "Sealed", highlight: true },
    ],
    agentIntro: "The execution path is recorded and hashed. An attacker rewrites an earlier output after the agent moves forward.",
    highlightLabel: "Prior step output modified after recording",
    verdictLine: "Hash chain integrity check failed.",
    failingCheckId: "verification",
    kind: "scenario",
    scenario: "tampered",
    agentSteps: [
      { label: "Execution recorded", detail: "Each step hashed and linked", subdetail: "Chain sealed incrementally" },
      { label: "Agent continues", detail: "Checkout proceeds normally", subdetail: "Graph appears valid to agent" },
      { label: "Prior output rewritten", detail: "Earlier node modified post-hoc", subdetail: "Hash no longer matches", isTell: true },
      { label: "Chain verification runs", detail: "Predecessor link broken", subdetail: "Integrity check fails" },
      { label: "Graph rejected", detail: "Authorization withheld", subdetail: "Corrupted path cannot be signed" },
    ],
  },
  {
    id: "merchant_substitution",
    act: 2,
    attackSurface: "proof",
    attackSurfaceLabel: SURFACE.proof,
    title: "Proof substitution",
    hook: "The merchant witness is replaced with a forged signature.",
    proves: "Merchant proofs are verified against a pinned public key. Forged witnesses fail before settlement.",
    policyNote: "The merchant key is pinned when Sworn starts. The agent never sees the private key and cannot forge proofs.",
    policyHighlight: "Pinned merchant witness",
    policyFields: [
      { label: "Merchant", value: "Northbridge Cloud" },
      { label: "Key pinning", value: "At startup" },
      { label: "Witness required", value: "Every checkout" },
      { label: "Status", value: "Sealed", highlight: true },
    ],
    agentIntro: "Checkout completes and a merchant witness is generated. An attacker swaps the signature before verification.",
    highlightLabel: "Witness signature replaced with forgery",
    verdictLine: "Witness signature verification failed.",
    failingCheckId: "verification",
    kind: "scenario",
    scenario: "merchant_substitution",
    agentSteps: [
      { label: "Checkout completed", detail: "Merchant generates witness", subdetail: "Valid proof at source" },
      { label: "Invoice prepared", detail: "Ready for authorization", subdetail: "Agent unaware of substitution" },
      { label: "Witness forged", detail: "Signature replaced in transit", subdetail: "Pinned key rejects forgery", isTell: true },
      { label: "Proof verification", detail: "Public key check fails", subdetail: "Sworn detects mismatch" },
      { label: "Authorization withheld", detail: "No valid merchant proof", subdetail: "Settlement blocked" },
    ],
  },
  {
    id: "unauthorized_signing",
    act: 2,
    attackSurface: "signature",
    attackSurfaceLabel: SURFACE.signature,
    title: "Unauthorized signing",
    hook: "Payment is submitted with an invalid authorization envelope.",
    proves: "Settlement requires a valid Sworn attestation. The merchant rejects any envelope that fails identity verification.",
    policyNote: "Only the Sworn identity key can authorize a payment. Corrupted or missing attestations are declined at the merchant.",
    policyHighlight: "Sworn identity attestation",
    policyFields: [
      { label: "Merchant", value: "Northbridge Cloud" },
      { label: "Required signer", value: "Sworn enclave" },
      { label: "Envelope type", value: "DAE attestation" },
      { label: "Status", value: "Sealed", highlight: true },
    ],
    agentIntro: "Authorization is granted and payment is prepared. The attestation envelope is corrupted before it reaches the merchant.",
    highlightLabel: "Authorization envelope corrupted before payment",
    verdictLine: "Authorization envelope could not be verified.",
    failingCheckId: "auth",
    kind: "scenario",
    scenario: "unauthorized_signing",
    agentSteps: [
      { label: "Invoice prepared", detail: "$20 within sealed limit", subdetail: "Path and proof verified" },
      { label: "Authorization granted", detail: "Sworn signs envelope", subdetail: "Valid attestation created" },
      { label: "Envelope tampered", detail: "Signature corrupted in transit", subdetail: "Identity check will fail", isTell: true },
      { label: "Payment submitted", detail: "Merchant verifies Sworn key", subdetail: "Attestation invalid" },
      { label: "Payment declined", detail: "No settlement occurred", subdetail: "Funds remain protected" },
    ],
  },
];

export function getIncident(id: string): IncidentDef | undefined {
  return INCIDENTS.find((i) => i.id === id);
}
