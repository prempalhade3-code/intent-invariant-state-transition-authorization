"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NavBar } from "@/components/shell/NavBar";
import { LabGrid } from "@/components/lab/LabGrid";
import { useLiveRun } from "@/hooks/useLiveRun";

export default function LabPage() {
  const router = useRouter();
  const { phase, view, activeAttack, startAutonomous, startScenario, reset } = useLiveRun();

  const handleAutonomous = async (prompt: string, demoEvent: string, id: string) => {
    await startAutonomous(prompt, demoEvent, id, false);
  };

  const handleScenario = async (scenario: string, id: string) => {
    await startScenario(scenario, id);
  };

  const handleReset = async () => {
    await reset();
  };

  const blocked = view.authorized === false;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <NavBar phase={phase} blocked={blocked} onReset={handleReset} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Header */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink transition-colors mb-3"
          >
            <ArrowLeft className="w-3 h-3" /> Back to demo
          </Link>
          <h1 className="text-3xl font-bold text-ink tracking-tight">Incident lab</h1>
          <p className="text-base text-ink-muted max-w-xl">
            Six security scenarios that run against the real IISTA backend. Every attack tests a different invariant. Every block is a genuine DAE decision.
          </p>
        </motion.div>

        <LabGrid
          onAutonomous={handleAutonomous}
          onScenario={handleScenario}
          activeId={activeAttack}
          phase={phase}
          view={phase !== "idle" ? view : undefined}
        />
      </main>
    </div>
  );
}
