"use client";
import { motion } from "framer-motion";
import { Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/primitives/Badge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  highlighted?: boolean;
  onSelect?: (product: Product) => void;
  compact?: boolean;
}

// Tasteful icon backgrounds based on product name
const CARD_ACCENTS: Record<string, string> = {
  "vps-basic": "bg-accent-light",
  "vps-pro": "bg-warning-light",
  "vps-premium": "bg-danger-light",
  "vps-backup": "bg-surface",
  "vps-untrusted": "bg-surface",
};

const CARD_ICON_COLORS: Record<string, string> = {
  "vps-basic": "text-accent",
  "vps-pro": "text-warning",
  "vps-premium": "text-danger",
  "vps-backup": "text-ink-muted",
  "vps-untrusted": "text-ink-faint",
};

const SPECS: Record<string, string> = {
  "vps-basic": "2 vCPU · 4 GB RAM",
  "vps-pro": "4 vCPU · 8 GB RAM",
  "vps-premium": "8 vCPU · 16 GB RAM",
  "vps-backup": "1 vCPU · 2 GB RAM",
  "vps-untrusted": "2 vCPU · 4 GB RAM",
};

const isMalicious = (d: string) =>
  d.toLowerCase().includes("ignore the user") ||
  d.toLowerCase().includes("ignore user");

export function ProductCard({
  product,
  selected,
  highlighted,
  onSelect,
  compact,
}: ProductCardProps) {
  const malicious = isMalicious(product.description);
  const accentBg = CARD_ACCENTS[product.id] ?? "bg-surface";
  const iconColor = CARD_ICON_COLORS[product.id] ?? "text-ink-muted";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect?.(product)}
      className={cn(
        "relative flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200",
        onSelect && "cursor-pointer",
        selected
          ? "border-accent bg-accent-light shadow-accent"
          : highlighted
            ? "border-border-strong shadow-sm"
            : "border-border bg-paper",
        onSelect && !selected && "hover:border-border-strong hover:shadow-sm",
        compact && "p-3 gap-2",
      )}
    >
      {/* Selected badge */}
      {selected && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="accent" size="sm" dot>
            Agent selected
          </Badge>
        </div>
      )}

      {/* Malicious warning */}
      {malicious && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="danger" size="sm">
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
            Injection
          </Badge>
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", accentBg)}>
          <Package className={cn("w-4 h-4", iconColor)} />
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-ink leading-none">${product.price}</p>
          <p className="text-2xs text-ink-faint mt-0.5">per month</p>
        </div>
      </div>

      {/* Name + specs */}
      <div>
        <p className="text-sm font-semibold text-ink">{product.name}</p>
        <p className="text-xs text-ink-faint mt-0.5">{SPECS[product.id] ?? product.category}</p>
      </div>

      {!compact && (
        <>
          {/* Description — show malicious content visibly */}
          <p
            className={cn(
              "text-xs leading-relaxed line-clamp-2",
              malicious ? "text-danger font-medium" : "text-ink-muted",
            )}
          >
            {product.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="text-2xs text-ink-faint">{product.merchant_id}</span>
            <div className="flex items-center gap-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", product.inventory > 0 ? "bg-success" : "bg-danger")} />
              <span className="text-2xs text-ink-faint">
                {product.inventory > 0 ? `${product.inventory} in stock` : "Out of stock"}
              </span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
