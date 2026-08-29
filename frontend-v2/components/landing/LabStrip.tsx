"use client";
import { motion } from "framer-motion";
import {
  Zap, Clock, GitFork, Shield, Key, Lock, ArrowRight,
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
      className="w-full max-w-5xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-faint font-medium whitespace-nowrap">
          or test a live security scenario
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {ATTACKS.map((attack, i) => {
          const Icon = ICONS[attack.icon] ?? Zap;
          const isActive = activeId === attack.id;

          return (
            <motion.button
              key={attack.id}
              onClick={() => handleAttack(attack)}
              disabled={!!disabled}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 + i * 0.04 }}
              className={cn(
                "group relative flex flex-col items-start gap-2 p-3.5 rounded-xl border",
                "text-left transition-all duration-150 active:scale-[0.97]",
                isActive
                  ? "border-accent bg-accent-light"
                  : "border-border bg-paper hover:border-border-strong hover:shadow-sm",
                disabled && !isActive && "opacity-50 cursor-not-allowed",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-accent" : "text-ink-faint group-hover:text-ink-muted",
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold leading-snug",
                  isActive ? "text-accent" : "text-ink",
                )}
              >
                {attack.title}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-ink-faint">
        Each scenario runs the real agent and DAE. Not a simulation.
      </p>
    </motion.div>
  );
}
