import { motion } from "framer-motion";
import { Hash } from "./Hash";
import type { IntentPolicy } from "../lib/types";

export function IntentPanel({
  prompt,
  policy,
  source,
  locked,
}: {
  prompt: string | null;
  policy: IntentPolicy | null;
  source: string | null;
  locked: boolean;
}) {
  const budget = policy?.budget_max ?? policy?.budget;
  const domains = policy?.allowed_domains ?? (policy?.domain ? [policy.domain] : []);
  return (
    <motion.section
      layout
      className="panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="panel-label">User intent</p>
      <div className="lock">{locked ? "Immutable once bound" : "Awaiting normalization"}</div>
      <p className="quote">{prompt || "No prompt received yet."}</p>
      {policy ? (
        <div className="kv">
          <div>
            <b>Goal</b>
            <span>{policy.goal ?? "—"}</span>
          </div>
          <div>
            <b>Budget</b>
            <span>
              {budget != null ? `$${budget}` : "—"} {policy.currency ?? ""}
            </span>
          </div>
          <div>
            <b>Merchant</b>
            <span>{policy.merchant_id ?? "—"}</span>
          </div>
          <div>
            <b>Domains</b>
            <span>{domains.join(", ") || "—"}</span>
          </div>
          <div>
            <b>Tools</b>
            <span>{(policy.allowed_tools ?? []).join(" · ") || "—"}</span>
          </div>
          <div>
            <b>Bound by</b>
            <span>{source ?? "authorization service"}</span>
          </div>
        </div>
      ) : (
        <p className="hint">Policy appears when the gateway emits intent_normalized.</p>
      )}
    </motion.section>
  );
}

export function HashNote({ value }: { value?: string }) {
  return <Hash value={value} />;
}
