import type { Gates, Phase } from "@/lib/types";

type Mode = "demo" | "live";

interface StatusBarProps {
  sessionId: string;
  phase: Phase;
  gates: Gates;
  mode?: Mode;
  onToggleMode?: () => void;
}

const PHASE_LABELS: Record<Phase, string> = {
  planning: "Planning",
  product: "CDD (Product Team)",
  dev: "TDD (Dev Team)",
  ops: "Deploy (Ops Team)",
};

export function StatusBar({ sessionId, phase, gates, mode = "demo", onToggleMode }: StatusBarProps) {
  const gateCount = [gates.cdd_complete, gates.tests_pass, gates.deploy_success].filter(
    Boolean
  ).length;

  return (
    <footer className="flex items-center px-4 py-1.5 bg-surface-1 border-t border-border text-xs text-text-muted gap-4">
      {/* Mode toggle */}
      <button
        onClick={onToggleMode}
        className={`
          px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors
          ${mode === "demo"
            ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
            : "bg-green-500/15 text-green-400 hover:bg-green-500/25"
          }
        `}
      >
        {mode === "demo" ? "Demo" : "Live"}
      </button>

      <span className="text-border">|</span>

      {sessionId ? (
        <>
          <span>
            Session:{" "}
            <span className="text-text-secondary font-mono">
              {sessionId.slice(0, 12)}
            </span>
          </span>
          <span className="text-border">|</span>
          <span>
            Phase: <span className="text-text-secondary">{PHASE_LABELS[phase]}</span>
          </span>
          <span className="text-border">|</span>
          <span>
            Gates:{" "}
            <span className="text-text-secondary">{gateCount}/3</span>
          </span>
        </>
      ) : (
        <span>No active session</span>
      )}
      <span className="ml-auto text-text-muted/60">isA IDE v0.1.0</span>
    </footer>
  );
}
