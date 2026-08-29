import { motion } from "framer-motion";
import type { BrowserFrame } from "../lib/reduce";

type Product = { id?: string; name?: string; price?: number; description?: string };

function productsOf(output: unknown, selected?: string | null): Product[] {
  if (!output || typeof output !== "object") return [];
  const record = output as Record<string, unknown>;
  const list = record.products;
  if (Array.isArray(list)) return list as Product[];
  if (record.product && typeof record.product === "object") return [record.product as Product];
  if (typeof record.product_id === "string") {
    return [{ id: record.product_id, price: Number(record.price), name: record.product_id }];
  }
  if (selected) return [{ id: selected, name: selected }];
  return [];
}

export function BrowserActivity({
  frame,
  selectedProduct,
}: {
  frame: BrowserFrame | null;
  selectedProduct: string | null;
}) {
  const products = productsOf(frame?.output, selectedProduct);
  const url =
    frame?.url ||
    (frame?.tool ? `mockstore.local/${frame.tool.replace(/_/g, "/")}` : "awaiting browser_action");
  return (
    <section className="panel browser" style={{ padding: 0 }}>
      <p className="panel-label" style={{ padding: "16px 16px 0" }}>
        Commerce environment
      </p>
      <div className="chrome">
        <span className="dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <div className="url">{url}</div>
      </div>
      <div className="page">
        {!frame ? (
          <p className="hint">The agent has not touched the marketplace yet.</p>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, color: "var(--faint)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {frame.tool?.replace(/_/g, " ") ?? "merchant"}
              {frame.domain ? ` · ${frame.domain}` : ""}
              {frame.productCount != null ? ` · ${frame.productCount} listings` : ""}
            </p>
            {products.length ? (
              products.map((p) => (
                <div key={String(p.id ?? p.name)} className="sku" data-on={p.id === selectedProduct ? "true" : "false"}>
                  <span>{p.name ?? p.id}</span>
                  <b>{p.price != null ? `$${p.price}` : ""}</b>
                </div>
              ))
            ) : (
              <p className="hint" style={{ whiteSpace: "pre-wrap" }}>
                {frame.output ? JSON.stringify(frame.output, null, 2).slice(0, 400) : "Action recorded."}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
