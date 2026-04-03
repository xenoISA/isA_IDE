import { motion } from "framer-motion";
import type { TDDOutputs } from "@/lib/types";
import { TEST_LAYERS } from "@/lib/types";

interface TDDStageProps {
  outputs: TDDOutputs;
  gateComplete: boolean;
}

export function TDDStage({ outputs, gateComplete }: TDDStageProps) {
  const { test_results, coverage, all_passing, code_changes } = outputs;

  const totalPassed = TEST_LAYERS.reduce(
    (sum, l) => sum + test_results[l.key].passed,
    0
  );
  const totalFailed = TEST_LAYERS.reduce(
    (sum, l) => sum + test_results[l.key].failed,
    0
  );
  const totalSkipped = TEST_LAYERS.reduce(
    (sum, l) => sum + test_results[l.key].skipped,
    0
  );
  const totalTests = totalPassed + totalFailed + totalSkipped;

  const tddPhase =
    totalTests === 0
      ? "waiting"
      : totalFailed > 0
        ? "red"
        : all_passing
          ? "green"
          : "refactor";

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl tracking-tight font-medium text-text-primary">
            Tests
          </h2>
          <p className="text-xs text-text-muted mt-1">
            <span className="font-mono tabular-nums text-text-secondary">
              {totalTests}
            </span>
            {" "}tests across 5 layers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TDDPhasePill phase={tddPhase} />
          <span
            className={`
              px-3 py-1 rounded-[--radius-button] text-xs font-medium border
              ${gateComplete
                ? "border-accent/30 text-accent bg-accent-dim"
                : "border-border text-text-muted bg-surface-1"
              }
            `}
          >
            {gateComplete ? "All Pass" : "Running"}
          </span>
        </div>
      </div>

      {/* Stats row -- pure numbers with labels, no card wrappers */}
      <div className="grid grid-cols-4 gap-8 mb-10">
        <StatValue label="Passed" value={totalPassed} variant="pass" />
        <StatValue label="Failed" value={totalFailed} variant="fail" />
        <StatValue label="Skipped" value={totalSkipped} variant="muted" />
        <StatValue label="Coverage" value={`${Math.round(coverage)}%`} variant="accent" />
      </div>

      {/* Test pyramid -- horizontal bars */}
      <div className="mb-8">
        <h3 className="text-xs font-medium text-text-muted mb-4 tracking-wide uppercase">
          Test Pyramid
        </h3>
        <div className="space-y-1.5">
          {TEST_LAYERS.map((layer, index) => {
            const result = test_results[layer.key];
            const total = result.passed + result.failed + result.skipped;
            const passPercent = total > 0 ? (result.passed / total) * 100 : 0;
            const failPercent = total > 0 ? (result.failed / total) * 100 : 0;

            return (
              <motion.div
                key={layer.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                {/* Level badge */}
                <span className="text-[10px] font-bold font-mono text-text-muted w-6 shrink-0">
                  {layer.level}
                </span>

                {/* Label */}
                <span className="text-xs text-text-secondary w-24 shrink-0">
                  {layer.label}
                </span>

                {/* Bar */}
                <div className="flex-1 h-6 bg-surface-1 rounded-[--radius-button] overflow-hidden relative">
                  {total > 0 && (
                    <>
                      {/* Pass segment */}
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-accent/25"
                        initial={{ width: 0 }}
                        animate={{ width: `${passPercent}%` }}
                        transition={{ delay: index * 0.08 + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                      {/* Fail segment */}
                      {result.failed > 0 && (
                        <motion.div
                          className="absolute inset-y-0 bg-fail/25"
                          initial={{ width: 0, left: `${passPercent}%` }}
                          animate={{ width: `${failPercent}%`, left: `${passPercent}%` }}
                          transition={{ delay: index * 0.08 + 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Numbers */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono tabular-nums text-[11px] text-accent w-6 text-right">
                    {result.passed}
                  </span>
                  <span className="text-text-muted/30 text-[10px]">/</span>
                  <span
                    className={`font-mono tabular-nums text-[11px] w-4 text-left ${
                      result.failed > 0 ? "text-fail" : "text-text-muted"
                    }`}
                  >
                    {result.failed}
                  </span>
                  <span className="text-text-muted/30 text-[10px]">/</span>
                  <span className="font-mono tabular-nums text-[11px] text-text-muted w-6 text-right">
                    {total}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Code changes */}
      {code_changes.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-text-muted mb-3 tracking-wide uppercase">
            Files Changed
            <span className="font-mono tabular-nums ml-2 text-text-secondary">
              {code_changes.length}
            </span>
          </h3>
          <div className="space-y-0.5">
            {code_changes.map((file, index) => (
              <motion.div
                key={file}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
                className="flex items-center gap-2.5 py-1.5 px-1"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    file.includes("test") ? "bg-accent" : "bg-info"
                  }`}
                />
                <span className="text-[11px] font-mono text-text-muted truncate">
                  {file}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function TDDPhasePill({ phase }: { phase: string }) {
  const config: Record<string, { label: string; className: string }> = {
    waiting: {
      label: "Waiting",
      className: "border-border text-text-muted",
    },
    red: {
      label: "RED",
      className: "border-fail/30 text-fail",
    },
    green: {
      label: "GREEN",
      className: "border-accent/30 text-accent",
    },
    refactor: {
      label: "REFACTOR",
      className: "border-warn/30 text-warn",
    },
  };
  const c = config[phase] ?? config.waiting;

  return (
    <span
      className={`px-2.5 py-0.5 rounded-[--radius-button] text-[10px] font-bold font-mono border bg-transparent ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function StatValue({
  label,
  value,
  variant,
}: {
  label: string;
  value: number | string;
  variant: "pass" | "fail" | "muted" | "accent";
}) {
  const colorMap = {
    pass: "text-accent",
    fail: "text-fail",
    muted: "text-text-muted",
    accent: "text-accent",
  };

  return (
    <div>
      <p className={`text-2xl font-mono tabular-nums font-medium ${colorMap[variant]}`}>
        {value}
      </p>
      <p className="text-[11px] text-text-muted mt-1">{label}</p>
    </div>
  );
}
