"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  selectedId?: string | null;
  searching?: boolean;
  searchQuery?: string;
  className?: string;
}

export function ProductGrid({
  products,
  selectedId,
  searching,
  searchQuery,
  className,
}: ProductGridProps) {
  const visible = selectedId
    ? products // show all, highlight selected
    : products;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search bar */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 border rounded-lg transition-all duration-200",
          searching
            ? "border-accent bg-accent-light"
            : "border-border bg-surface",
        )}
      >
        <Search
          className={cn("w-3.5 h-3.5 flex-shrink-0", searching ? "text-accent" : "text-ink-faint")}
        />
        <span
          className={cn(
            "text-sm flex-1 font-mono",
            searching ? "text-accent" : "text-ink-faint",
          )}
        >
          {searching && searchQuery ? searchQuery : "Approved marketplace"}
        </span>
        {searching && (
          <span className="text-2xs text-accent font-semibold animate-pulse">
            {visible.length} results
          </span>
        )}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 gap-2"
      >
        <AnimatePresence initial={false}>
          {visible.map((product, i) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.04,
              }}
            >
              <ProductCard
                product={product}
                selected={product.id === selectedId}
                compact
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <div className="text-center py-6 text-sm text-ink-faint">
          No products found
        </div>
      )}
    </div>
  );
}
