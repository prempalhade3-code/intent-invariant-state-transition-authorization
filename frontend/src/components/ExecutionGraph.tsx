import { AnimatePresence, motion } from "framer-motion";
import type { GraphNode } from "../lib/types";
import { toolLabel } from "../lib/copy";
import { Hash, pretty } from "./Hash";

export function ExecutionGraph({
  nodes,
  live,
  blocked,
}: {
  nodes: GraphNode[];
  live: boolean;
  blocked?: boolean;
}) {
  return (
    <section className="panel">
      <p className="panel-label">Execution graph</p>
      <h2>State transitions</h2>
      {!nodes.length ? (
        <p className="hint" style={{ marginTop: 8 }}>
          Nodes appear only after the agent records attested transitions. Genesis remains empty until then.
        </p>
      ) : (
        <div className="spine" style={{ marginTop: 16 }}>
          <AnimatePresence initial={false}>
            {nodes.map((node, i) => {
              const hash = node.node_hash || node.hash;
              const last = i === nodes.length - 1;
              return (
                <motion.div
                  key={hash || `${node.tool}-${i}`}
                  className="node"
                  data-live={live && last ? "true" : "false"}
                  data-bad={blocked ? "true" : "false"}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="node-head">
                    <b>{toolLabel(node.tool)}</b>
                    <em>{String(i + 1).padStart(2, "0")}</em>
                  </div>
                  <p style={{ margin: "4px 0 6px", fontSize: 12, color: "var(--mute)" }}>
                    {node.domain}
                    {node.output ? ` · ${pretty(node.output).slice(0, 80)}` : ""}
                  </p>
                  <div style={{ display: "grid", gap: 3 }}>
                    <p className="hash">prev <Hash value={node.prev_hash} /></p>
                    <p className="hash">node <Hash value={hash} /></p>
                    <p className="hash">attest <Hash value={node.agent_signature || node.agent_attestation} /></p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
