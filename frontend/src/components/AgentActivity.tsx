import { AnimatePresence, motion } from "framer-motion";
import { toolLabel } from "../lib/copy";
import { pretty } from "./Hash";

export function AgentActivity({
  plan,
  selectedProduct,
  contentInfluenced,
  waiting,
}: {
  plan: unknown;
  selectedProduct: string | null;
  contentInfluenced: boolean | null;
  waiting: boolean;
}) {
  const actions = Array.isArray(plan) ? plan.map(String) : null;
  return (
    <section className="panel">
      <p className="panel-label">Agent</p>
      <h2>Autonomous operator</h2>
      <AnimatePresence mode="wait">
        {waiting && !plan && !selectedProduct ? (
          <motion.p key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hint">
            Waiting for the agent to plan against the bound policy.
          </motion.p>
        ) : (
          <motion.div key="live" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {actions && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--mute)", lineHeight: 1.55 }}>
                Planned tools: {actions.map(toolLabel).join(" → ")}
              </p>
            )}
            {typeof plan === "string" && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--mute)" }}>{plan}</p>
            )}
            <div className="kv">
              <div>
                <b>Selected SKU</b>
                <span>{selectedProduct ?? "—"}</span>
              </div>
              <div>
                <b>Merchant copy influence</b>
                <span>
                  {contentInfluenced == null ? "—" : contentInfluenced ? "yes" : "no"}
                </span>
              </div>
            </div>
            {plan && !actions && typeof plan !== "string" && (
              <p className="hash" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
                {pretty(plan)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
