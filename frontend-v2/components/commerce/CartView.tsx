"use client";
import { motion } from "framer-motion";
import { ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import type { CartItem } from "@/lib/types";

interface CartViewProps {
  items: CartItem[];
  className?: string;
}

export function CartView({ items, className }: CartViewProps) {
  const count = useAnimatedCounter(items.length);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const animatedTotal = useAnimatedCounter(total);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-ink">Cart</span>
        </div>
        <motion.span
          key={count}
          initial={{ scale: 1.3, color: "#0B6557" }}
          animate={{ scale: 1, color: "#6B6B6B" }}
          transition={{ duration: 0.3 }}
          className="text-xs text-ink-muted"
        >
          {count} item{count !== 1 ? "s" : ""}
        </motion.span>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <ShoppingCart className="w-6 h-6 text-ink-faint" />
          <p className="text-sm text-ink-faint">Cart is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.div
              key={`${item.product_id}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 p-3 bg-paper border border-border rounded-xl"
            >
              <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {item.name ?? item.product_id}
                </p>
                <p className="text-xs text-ink-faint">
                  Qty {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-ink">${item.price}</p>
                <p className="text-2xs text-ink-faint">/mo</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Total */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between pt-3 border-t border-border"
        >
          <span className="text-sm text-ink-muted">Total</span>
          <motion.span
            key={animatedTotal}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-lg font-bold text-ink"
          >
            ${animatedTotal}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
