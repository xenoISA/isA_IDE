import { motion } from "framer-motion";
import { CodeStage } from "@/stages/CodeStage";

interface DevCodePanelProps {
  codeChanges: string[];
  coverage: number;
  allPassing: boolean;
  mode?: "demo" | "live";
}

function CoverageBar({ coverage }: { coverage: number }) {
  return (
    <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${coverage}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
    </div>
  );
}

function StatusBadge({ allPassing }: { allPassing: boolean }) {
  if (allPassing) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-dim text-accent text-[11px] font-medium">
        <svg
          className="w-3 h-3"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l2 2 4-4" />
        </svg>
        All tests passing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fail/10 text-fail text-[11px] font-medium">
      <svg
        className="w-3 h-3"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l6 6M9 3l-6 6" />
      </svg>
      Tests failing
    </span>
  );
}

export function DevCodePanel({ codeChanges, coverage, allPassing, mode = "demo" }: DevCodePanelProps) {
  return (
    <motion.div
      className="max-w-4xl space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Dev-specific header with coverage and status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl tracking-tight font-medium text-text-primary">
              Generated Code
            </h2>
            <StatusBadge allPassing={allPassing} />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-text-muted">Coverage</span>
            <span className="text-sm font-mono font-medium text-text-primary tabular-nums">
              {coverage}%
            </span>
          </div>
        </div>

        {/* Thin coverage bar */}
        <CoverageBar coverage={coverage} />
      </div>

      {/* Wrapped CodeStage with mode awareness */}
      <CodeStage codeChanges={codeChanges} mode={mode} />
    </motion.div>
  );
}
