import { motion } from "framer-motion";
import type { Stage, Gates } from "@/lib/types";

const STAGES: { key: Stage; label: string }[] = [
  { key: "intent", label: "Intent" },
  { key: "cdd", label: "CDD" },
  { key: "tdd", label: "TDD" },
  { key: "code", label: "Code" },
  { key: "ship", label: "Ship" },
];

const GATE_MAP: Partial<Record<Stage, keyof Gates>> = {
  cdd: "cdd_complete",
  tdd: "tests_pass",
  ship: "deploy_success",
};

/** Order index used to determine which connectors are "completed" */
const STAGE_INDEX: Record<Stage, number> = {
  intent: 0,
  cdd: 1,
  tdd: 2,
  code: 3,
  ship: 4,
};

interface StageNavProps {
  activeStage: Stage;
  onStageChange: (stage: Stage) => void;
  gates: Gates;
  isRunning: boolean;
}

function GateCircle({ complete }: { complete: boolean }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className="absolute -top-1 -right-1"
      aria-hidden="true"
    >
      <circle
        cx="4"
        cy="4"
        r="3.5"
        className={
          complete
            ? "fill-accent stroke-accent/30"
            : "fill-surface-2 stroke-border"
        }
        strokeWidth="1"
      />
    </svg>
  );
}

function Connector({ completed }: { completed: boolean }) {
  return (
    <div className="flex items-center w-6 mx-0.5">
      {completed ? (
        <div className="h-px w-full bg-accent/50" />
      ) : (
        <svg width="100%" height="2" className="overflow-visible">
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </svg>
      )}
    </div>
  );
}

export function StageNav({
  activeStage,
  onStageChange,
  gates,
  isRunning,
}: StageNavProps) {
  const activeIdx = STAGE_INDEX[activeStage];

  /** A connector is "completed" if the gate for the stage it leads INTO is complete */
  function isConnectorCompleted(stageIdx: number): boolean {
    const stage = STAGES[stageIdx];
    if (!stage) return false;
    const gateKey = GATE_MAP[stage.key];
    if (gateKey && gates[gateKey]) return true;
    // Also mark completed if every prior gate is done and this stage is past
    if (stageIdx <= activeIdx) {
      const priorGates = STAGES.slice(0, stageIdx)
        .map((s) => GATE_MAP[s.key])
        .filter(Boolean) as (keyof Gates)[];
      return priorGates.every((g) => gates[g]);
    }
    return false;
  }

  return (
    <nav className="mx-4 mt-3 mb-1">
      <div className="glass rounded-[var(--radius-outer)] px-4 py-2 flex items-center gap-1">
        {/* Logo */}
        <span className="text-sm font-medium tracking-wide text-text-secondary mr-5 select-none">
          isA
          <span className="text-text-muted ml-0.5">IDE</span>
        </span>

        {/* Pipeline stages */}
        <div className="flex items-center">
          {STAGES.map((stage, i) => {
            const isActive = activeStage === stage.key;
            const gateKey = GATE_MAP[stage.key];
            const gateComplete = gateKey ? gates[gateKey] : false;

            return (
              <div key={stage.key} className="flex items-center">
                {/* Connector line */}
                {i > 0 && <Connector completed={isConnectorCompleted(i)} />}

                {/* Stage button */}
                <motion.button
                  onClick={() => onStageChange(stage.key)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className={[
                    "relative px-4 py-1.5 rounded-[var(--radius-button)] text-xs font-medium",
                    "cursor-pointer transition-colors duration-150",
                    isActive
                      ? "bg-accent-dim text-accent border border-border-accent"
                      : "text-text-muted hover:text-text-secondary border border-transparent",
                  ].join(" ")}
                >
                  {stage.label}

                  {/* Gate indicator */}
                  {gateKey && <GateCircle complete={gateComplete} />}
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Running indicator */}
        <div className="ml-auto flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-text-secondary">Running</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
