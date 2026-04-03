import type { Stage, Gates } from "@/lib/types";

const STAGES: { key: Stage; label: string; colorVar: string }[] = [
  { key: "intent", label: "Intent", colorVar: "var(--color-stage-intent)" },
  { key: "cdd", label: "CDD", colorVar: "var(--color-stage-cdd)" },
  { key: "tdd", label: "TDD", colorVar: "var(--color-stage-tdd)" },
  { key: "code", label: "Code", colorVar: "var(--color-stage-code)" },
  { key: "ship", label: "Ship", colorVar: "var(--color-stage-ship)" },
];

const GATE_MAP: Partial<Record<Stage, keyof Gates>> = {
  cdd: "cdd_complete",
  tdd: "tests_pass",
  ship: "deploy_success",
};

interface StageNavProps {
  activeStage: Stage;
  onStageChange: (stage: Stage) => void;
  gates: Gates;
  isRunning: boolean;
}

export function StageNav({ activeStage, onStageChange, gates, isRunning }: StageNavProps) {
  return (
    <nav className="flex items-center gap-1 px-4 py-2 bg-surface-1 border-b border-border">
      {/* Logo */}
      <span className="text-sm font-semibold text-text-secondary mr-4 tracking-wider">
        isA
        <span className="text-text-primary ml-0.5">IDE</span>
      </span>

      {/* Pipeline connector + stages */}
      <div className="flex items-center gap-0.5">
        {STAGES.map((stage, i) => {
          const isActive = activeStage === stage.key;
          const gateKey = GATE_MAP[stage.key];
          const gateComplete = gateKey ? gates[gateKey] : false;

          return (
            <div key={stage.key} className="flex items-center">
              {/* Connector line */}
              {i > 0 && (
                <div
                  className="w-6 h-px mx-0.5"
                  style={{
                    background: gateComplete
                      ? "var(--color-gate-complete)"
                      : "var(--color-border)",
                  }}
                />
              )}

              {/* Stage button */}
              <button
                onClick={() => onStageChange(stage.key)}
                className={`
                  relative px-4 py-1.5 rounded-md text-xs font-medium
                  transition-all duration-150 cursor-pointer
                  ${isActive
                    ? "text-white"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  }
                `}
                style={
                  isActive
                    ? { background: stage.colorVar, boxShadow: `0 0 12px ${stage.colorVar}40` }
                    : undefined
                }
              >
                {stage.label}

                {/* Gate indicator dot */}
                {gateKey && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{
                      background: gateComplete
                        ? "var(--color-gate-complete)"
                        : "var(--color-gate-locked)",
                    }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Running indicator */}
      <div className="ml-auto flex items-center gap-2">
        {isRunning && (
          <div className="flex items-center gap-1.5 text-xs text-running">
            <span className="w-1.5 h-1.5 rounded-full bg-running animate-pulse" />
            Running
          </div>
        )}
      </div>
    </nav>
  );
}
