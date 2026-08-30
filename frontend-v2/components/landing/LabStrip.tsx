"use client";
import { motion } from "framer-motion";
import {
  Zap, Clock, GitFork, Shield, Key, Lock,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ATTACKS } from "@/lib/api";
import type { Attack } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Clock, GitFork, Shield, Key, Lock,
};

interface LabStripProps {
  onAutonomous: (prompt: string, demoEvent: string, id: string) => void;
  onScenario: (scenario: string, id: string) => void;
  disabled?: boolean;
  activeId?: string | null;
}

export function LabStrip({ onAutonomous, onScenario, disabled, activeId }: LabStripProps) {
  const handleAttack = (attack: Attack) => {
    if (disabled) return;
    if (attack.kind === "autonomous") {
      onAutonomous(attack.prompt ?? "", attack.demoEvent ?? "", attack.id);
    } else if (attack.scenario) {
      onScenario(attack.scenario, attack.id);
    }
  };

  return (
    <motion.div
      className="w-full mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ATTACKS.map((attack, i) => {
          const Icon = ICONS[attack.icon] ?? Zap;
          const isActive = activeId === attack.id;

          return (
            <motion.button
              key={attack.id}
              onClick={() => handleAttack(attack)}
              disabled={!!disabled}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.05 }}
              className={cn(
                "group relative flex flex-col items-center justify-center text-center gap-3 p-5 rounded-2xl border",
                "transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "border-accent bg-accent-light shadow-sm"
                  : "border-border bg-paper hover:border-border-strong hover:shadow-sm",
                disabled && !isActive && "opacity-50 cursor-not-allowed",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-accent" : "text-ink-faint group-hover:text-ink-muted",
                )}
              />
              <span
                className={cn(
                  "text-[13px] font-medium leading-tight",
                  isActive ? "text-accent" : "text-ink",
                )}
              >
                {attack.title}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[11px] font-mono tracking-widest uppercase text-ink-faint">
        Each scenario runs the real agent and DAE. Not a simulation.
      </p>
    </motion.div>
  );
}
