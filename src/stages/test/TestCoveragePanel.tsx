import { motion } from "framer-motion";
import type { RuleResult } from "@/lib/mock-test-data";
import type { RuleTestMapping } from "@/lib/types";

interface TestCoveragePanelProps {
  ruleResults: RuleResult[];
  mappings: RuleTestMapping[];
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

/* ─── Component ──────────────────────────────────────────────── */

export function TestCoveragePanel({ ruleResults, mappings }: TestCoveragePanelProps) {
  const coveredCount = ruleResults.filter((r) => r.totalTests > 0).length;
  const totalCount = ruleResults.length;
  const coveragePercent = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;

  if (ruleResults.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No rule results available. Run the test pipeline to generate coverage data.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h2 className="text-xl tracking-tight font-medium text-text-primary">
          Coverage
        </h2>
        <p className="text-xs font-mono text-text-muted mt-1 tabular-nums">
          {coveredCount} of {totalCount} rules covered
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={item}>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-lg font-mono tabular-nums text-text-primary">
            {coveragePercent}%
          </span>
          <span className="text-xs font-mono text-text-muted tabular-nums">
            {ruleResults.reduce((sum, r) => sum + r.totalTests, 0)} total tests
          </span>
        </div>
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${coveragePercent}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <div className="h-full bg-accent rounded-full" />
          </motion.div>
        </div>
      </motion.div>

      {/* Coverage table */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner p-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border w-20">
                    Rule ID
                  </th>
                  <th className="text-left font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border">
                    Rule Name
                  </th>
                  <th className="text-center font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border w-16">
                    Tests
                  </th>
                  <th className="text-center font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border w-16">
                    Pass
                  </th>
                  <th className="text-center font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border w-16">
                    Fail
                  </th>
                  <th className="text-center font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border w-24">
                    Coverage
                  </th>
                </tr>
              </thead>
              <tbody>
                {ruleResults.map((rule) => {
                  const hasTests = rule.totalTests > 0;
                  const mapping = mappings.find((m) => m.ruleId === rule.ruleId);
                  const mappedCount = mapping ? mapping.tests.length : 0;
                  const passRate = rule.totalTests > 0
                    ? Math.round((rule.passed / rule.totalTests) * 100)
                    : 0;

                  return (
                    <tr
                      key={rule.ruleId}
                      className={!hasTests ? "bg-fail/5" : ""}
                    >
                      <td
                        className={[
                          "font-mono text-text-muted px-4 py-3 border border-border align-middle",
                          !hasTests ? "border-l-2 border-l-fail/40" : "",
                        ].join(" ")}
                      >
                        {rule.ruleId}
                      </td>
                      <td className="text-text-secondary px-4 py-3 border border-border align-middle">
                        <span className="font-medium text-text-primary">
                          {rule.ruleName}
                        </span>
                        {mappedCount > 0 && mappedCount !== rule.totalTests && (
                          <span className="text-[10px] font-mono text-text-ghost ml-2">
                            {mappedCount} mapped
                          </span>
                        )}
                      </td>
                      <td className="text-center font-mono tabular-nums text-text-secondary px-4 py-3 border border-border align-middle">
                        {rule.totalTests > 0 ? rule.totalTests : (
                          <span className="text-fail/60">0</span>
                        )}
                      </td>
                      <td className="text-center font-mono tabular-nums px-4 py-3 border border-border align-middle">
                        <span className={rule.passed > 0 ? "text-pass" : "text-text-ghost"}>
                          {rule.passed}
                        </span>
                      </td>
                      <td className="text-center font-mono tabular-nums px-4 py-3 border border-border align-middle">
                        <span className={rule.failed > 0 ? "text-fail" : "text-text-ghost"}>
                          {rule.failed}
                        </span>
                      </td>
                      <td className="px-4 py-3 border border-border align-middle">
                        {hasTests ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-surface-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent rounded-full"
                                // Using percentage width via className for static render
                              >
                                <motion.div
                                  className="h-full bg-accent rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${passRate}%` }}
                                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                                />
                              </div>
                            </div>
                            <span className="text-[10px] font-mono tabular-nums text-text-muted w-8 text-right">
                              {passRate}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-fail/60">
                            No coverage
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
