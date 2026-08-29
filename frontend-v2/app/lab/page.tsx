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

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-14 md:px-8 md:py-20 space-y-12">
        {/* Header */}
        <motion.div
          className="max-w-3xl space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to demo
          </Link>
          <p className="text-[10px] font-mono uppercase tracking-[.16em] text-ink-faint">Security research environment</p>
          <h1 className="text-[48px] leading-[.95] font-semibold text-ink tracking-[-.065em]">Break the assumptions.</h1>
          <p className="max-w-2xl text-[17px] text-ink-muted leading-relaxed">
            Six ways an autonomous purchase can become invalid. Each case runs against the same policy boundary. Each decision comes from SWORN, not the interface.
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
