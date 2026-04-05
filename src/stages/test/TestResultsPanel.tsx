import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RuleResult } from "@/lib/mock-test-data";

interface TestResultsPanelProps {
  ruleResults: RuleResult[];
}

/* ─── SVG Icons ──────────────────────────────────────────────── */

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={[
        "w-3.5 h-3.5 text-text-muted transition-transform duration-200",
        expanded ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
    </svg>
  );
}

/* ─── Stagger animation ─────────────────────────────────────── */

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0.4, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

/* ─── Individual rule result card ────────────────────────────── */

function RuleResultCard({ rule }: { rule: RuleResult }) {
  const [expanded, setExpanded] = useState(false);
  const hasFails = rule.failed > 0;
  const passRate = rule.totalTests > 0
    ? Math.round((rule.passed / rule.totalTests) * 100)
    : 0;
  const failRate = rule.totalTests > 0
    ? Math.round((rule.failed / rule.totalTests) * 100)
    : 0;

  return (
    <div className="bezel overflow-hidden">
      <div
        className={[
          "bezel-inner",
          hasFails ? "border-l-[3px] border-l-fail" : "",
        ].join(" ")}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-5 py-4 cursor-pointer"
        >
          {/* Rule ID pill */}
          <span className="font-mono text-xs text-text-muted bg-surface-2 px-2.5 py-1 rounded-full shrink-0">
            {rule.ruleId}
          </span>

          {/* Rule name */}
          <span className="text-sm font-medium text-text-primary tracking-tight">
            {rule.ruleName}
          </span>

          {/* Counts */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs tabular-nums text-pass">
              {rule.passed}p
            </span>
            <span className="font-mono text-xs tabular-nums text-fail">
              {rule.failed}f
            </span>
            {rule.skipped > 0 && (
              <span className="font-mono text-xs tabular-nums text-text-ghost">
                {rule.skipped}s
              </span>
            )}
            <ChevronIcon expanded={expanded} />
          </div>
        </button>

        {/* Pass ratio bar */}
        {rule.totalTests > 0 && (
          <div className="px-5 pb-3">
            <div className="h-1 bg-surface-2 rounded-full overflow-hidden flex">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${passRate}%` }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
              {rule.failed > 0 && (
                <motion.div
                  className="h-full bg-fail"
                  initial={{ width: 0 }}
                  animate={{ width: `${failRate}%` }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              )}
            </div>
          </div>
        )}

        {/* Expandable test list */}
        <AnimatePresence>
          {expanded && rule.totalTests > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 border-t border-border">
                <div className="pt-3 space-y-1.5">
                  {Array.from({ length: rule.totalTests }).map((_, idx) => {
                    const isPassed = idx < rule.passed;
                    const isFailed = idx >= rule.passed && idx < rule.passed + rule.failed;
                    const status = isPassed ? "pass" : isFailed ? "fail" : "skip";
                    const statusColor = isPassed
                      ? "text-pass"
                      : isFailed
                        ? "text-fail"
                        : "text-text-ghost";

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 text-[11px] font-mono"
                      >
                        <span className={`shrink-0 ${statusColor}`}>
                          {status}
                        </span>
                        <span className="text-text-secondary">
                          test_{rule.ruleName.toLowerCase().replace(/\s+/g, "_")}_{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No tests state */}
        {rule.totalTests === 0 && (
          <div className="px-5 pb-4">
            <span className="text-[10px] font-mono text-fail/60">
              No tests mapped to this rule
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────── */

export function TestResultsPanel({ ruleResults }: TestResultsPanelProps) {
  const totalTests = ruleResults.reduce((sum, r) => sum + r.totalTests, 0);
  const totalPassed = ruleResults.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = ruleResults.reduce((sum, r) => sum + r.failed, 0);

  if (ruleResults.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No test results available. Run the test pipeline to generate results.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl space-y-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-4">
        <h2 className="text-xl tracking-tight font-medium text-text-primary">
          Results
        </h2>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs font-mono text-text-muted tabular-nums">
            {totalTests} tests
          </span>
          <span className="text-xs font-mono text-pass tabular-nums">
            {totalPassed} passed
          </span>
          <span className="text-xs font-mono text-fail tabular-nums">
            {totalFailed} failed
          </span>
        </div>
      </motion.div>

      {/* Rule result cards */}
      {ruleResults.map((rule) => (
        <motion.div key={rule.ruleId} variants={item}>
          <RuleResultCard rule={rule} />
        </motion.div>
      ))}
    </motion.div>
  );
}
