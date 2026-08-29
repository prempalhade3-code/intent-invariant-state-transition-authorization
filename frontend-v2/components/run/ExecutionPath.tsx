"use client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { HashChip } from "@/components/primitives/HashChip";
import type { GraphNode } from "@/lib/types";

interface ExecutionPathProps {
  nodes: GraphNode[];
  blocked?: boolean;
  className?: string;
}

const TOOL_SHORT: Record<string, string> = {
  search_products: "search",
  view_product: "view",
  add_to_cart: "cart",
  checkout: "checkout",
  read_invoice: "invoice",
  unauthorized_api: "⚠ unauthorized",
  genesis: "genesis",
};

function NodeBubble({
  node,
  index,
  total,
  blocked,
}: {
  node: GraphNode;
  index: number;
  total: number;
  blocked?: boolean;
}) {
  const isLast = index === total - 1;
  const isBlocked = blocked && isLast;
  const hash = node.node_hash || node.hash || "";
  const label = TOOL_SHORT[node.tool] ?? node.tool.replace(/_/g, " ");

  return (
    <motion.div
      className="flex items-center gap-1.5"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
    >
      {/* Connector */}
      {index > 0 && (
        <div className={cn("w-4 h-px flex-shrink-0", isBlocked ? "bg-danger/30" : "bg-border")} />
      )}

      {/* Node */}
      <div className="flex flex-col items-center gap-1">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold border",
            isBlocked
              ? "bg-danger-light border-blocked-border text-danger"
              : "bg-success-light border-authorized-border text-success",
          )}
        >
          {index + 1}
        </div>
        <span
          className={cn(
            "text-2xs whitespace-nowrap font-medium",
            isBlocked ? "text-danger" : "text-ink-faint",
          )}
        >
          {label}
        </span>
        {hash && (
          <HashChip value={hash} className="text-[9px]" />
        )}
      </div>
    </motion.div>
  );
}

export function ExecutionPath({ nodes, blocked, className }: ExecutionPathProps) {
  if (!nodes.length) {
    return (
      <div className={cn("py-3", className)}>
        <p className="section-label">Execution path</p>
        <p className="text-xs text-ink-faint">
          Nodes appear as the agent acts
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="section-label">Execution path · {nodes.length} node{nodes.length !== 1 ? "s" : ""}</p>

      {/* Horizontal scroll node chain */}
      <div className="overflow-x-auto pb-2 scroll-thin">
        <div className="flex items-center gap-0 min-w-max py-1">
          <AnimatePresence initial={false}>
            {nodes.map((node, i) => (
              <NodeBubble
                key={node.node_hash || node.hash || i}
                node={node}
                index={i}
                total={nodes.length}
                blocked={blocked}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Hash chain tail */}
      {nodes.length > 0 && (
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <span className="text-2xs text-ink-faint">Tip</span>
          <HashChip
            value={nodes[nodes.length - 1].node_hash || nodes[nodes.length - 1].hash}
          />
        </div>
      )}
    </div>
  );
}
