import type { TDDOutputs } from "@/lib/types";
import { TEST_LAYERS } from "@/lib/types";

interface TDDStageProps {
  outputs: TDDOutputs;
  gateComplete: boolean;
}

export function TDDStage({ outputs, gateComplete }: TDDStageProps) {
  const { test_results, coverage, all_passing, code_changes } = outputs;

  const totalPassed = TEST_LAYERS.reduce(
    (sum, l) => sum + test_results[l.key].passed, 0
  );
  const totalFailed = TEST_LAYERS.reduce(
    (sum, l) => sum + test_results[l.key].failed, 0
  );
  const totalSkipped = TEST_LAYERS.reduce(
    (sum, l) => sum + test_results[l.key].skipped, 0
  );
  const totalTests = totalPassed + totalFailed + totalSkipped;

  // Determine RED/GREEN/REFACTOR status
  const tddPhase = totalTests === 0
    ? "waiting"
    : totalFailed > 0
      ? "red"
      : all_passing
        ? "green"
        : "refactor";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Test-Driven Development
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {totalTests} tests across 5 layers
          </p>
        </div>

        {/* Gate + TDD Phase */}
        <div className="flex items-center gap-2">
          <TDDPhaseBadge phase={tddPhase} />
          <div
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${gateComplete
                ? "bg-gate-complete/15 text-gate-complete"
                : "bg-surface-2 text-text-muted"
              }
            `}
          >
            {gateComplete ? "All Pass" : "Running"}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Passed" value={totalPassed} color="var(--color-pass)" />
        <StatCard label="Failed" value={totalFailed} color="var(--color-fail)" />
        <StatCard label="Skipped" value={totalSkipped} color="var(--color-skip)" />
        <StatCard label="Coverage" value={`${Math.round(coverage)}%`} color="var(--color-stage-tdd)" />
      </div>

      {/* Test Pyramid */}
      <div className="mb-6">
        <h3 className="text-xs font-medium text-text-secondary mb-3">
          Test Pyramid
        </h3>
        <div className="flex flex-col items-center gap-1">
          {/* Pyramid rendered top-down (E2E at top, Unit at bottom = widest) */}
          {[...TEST_LAYERS].reverse().map((layer, i) => {
            const result = test_results[layer.key];
            const total = result.passed + result.failed + result.skipped;
            const width = 30 + (i * 14); // pyramid shape: narrow top, wide bottom

            return (
              <div
                key={layer.key}
                className="relative rounded-sm overflow-hidden"
                style={{ width: `${width}%`, height: "32px" }}
              >
                {/* Background */}
                <div className="absolute inset-0 bg-surface-2" />

                {/* Pass bar */}
                {total > 0 && (
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${(result.passed / total) * 100}%`,
                      background:
                        result.failed > 0
                          ? "var(--color-fail)"
                          : "var(--color-pass)",
                      opacity: 0.3,
                    }}
                  />
                )}

                {/* Label */}
                <div className="relative flex items-center justify-between px-3 h-full">
                  <span className="text-[10px] font-medium text-text-secondary">
                    {layer.level} {layer.label}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {total > 0
                      ? `${result.passed}/${total}`
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-layer details */}
      <div className="space-y-2">
        {TEST_LAYERS.map((layer) => {
          const result = test_results[layer.key];
          const total = result.passed + result.failed + result.skipped;

          return (
            <TestLayerRow
              key={layer.key}
              level={layer.level}
              label={layer.label}
              passed={result.passed}
              failed={result.failed}
              skipped={result.skipped}
              total={total}
            />
          );
        })}
      </div>

      {/* Code changes */}
      {code_changes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-medium text-text-secondary mb-2">
            Files Changed ({code_changes.length})
          </h3>
          <div className="space-y-1">
            {code_changes.map((file) => (
              <div
                key={file}
                className="text-[11px] font-mono text-text-muted px-2 py-1 bg-surface-2 rounded"
              >
                {file}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function TDDPhaseBadge({ phase }: { phase: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    waiting: { label: "Waiting", bg: "bg-surface-2", text: "text-text-muted" },
    red: { label: "RED", bg: "bg-fail/15", text: "text-fail" },
    green: { label: "GREEN", bg: "bg-pass/15", text: "text-pass" },
    refactor: { label: "REFACTOR", bg: "bg-stage-tdd/15", text: "text-stage-tdd" },
  };
  const c = config[phase] ?? config.waiting;

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-surface-1 border border-border rounded-lg p-3 text-center">
      <p className="text-lg font-semibold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
    </div>
  );
}

function TestLayerRow({
  level,
  label,
  passed,
  failed,
  skipped,
  total,
}: {
  level: string;
  label: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-1 border border-border rounded-lg">
      <span className="text-[10px] font-bold text-text-muted w-6">{level}</span>
      <span className="text-xs text-text-secondary flex-1">{label}</span>
      <div className="flex items-center gap-3 text-[10px] font-mono">
        <span className="text-pass">{passed} pass</span>
        <span className={failed > 0 ? "text-fail" : "text-text-muted"}>
          {failed} fail
        </span>
        <span className="text-text-muted">{skipped} skip</span>
        <span className="text-text-muted/60">({total})</span>
      </div>
    </div>
  );
}
