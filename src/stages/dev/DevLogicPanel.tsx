import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BusinessRule, RuleTestMapping, TestLayer } from "@/lib/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface DevLogicPanelProps {
  logicContent: string;
  rules: BusinessRule[];
  mappings: RuleTestMapping[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const LAYER_COLORS: Record<TestLayer, string> = {
  unit: "text-accent bg-accent-dim",
  component: "text-info bg-info/10",
  integration: "text-warn bg-warn/10",
  api: "text-text-primary bg-surface-3",
  smoke: "text-fail bg-fail/10",
};

const STATUS_COLORS: Record<"pass" | "fail" | "skip", string> = {
  pass: "text-accent",
  fail: "text-fail",
  skip: "text-text-muted",
};

function StatusIcon({ status }: { status: "all-pass" | "has-fail" | "untested" }) {
  if (status === "all-pass") {
    return (
      <svg
        className="w-5 h-5 text-accent"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l3 3 5-6" />
      </svg>
    );
  }
  if (status === "has-fail") {
    return (
      <svg
        className="w-5 h-5 text-fail"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l6 6M11 5l-6 6" />
      </svg>
    );
  }
  return (
    <span className="text-[10px] font-mono text-text-ghost">untested</span>
  );
}

function getRuleVerificationStatus(
  ruleId: string,
  mappings: RuleTestMapping[]
): "all-pass" | "has-fail" | "untested" {
  const mapping = mappings.find((m) => m.ruleId === ruleId);
  if (!mapping || mapping.tests.length === 0) return "untested";
  if (mapping.tests.some((t) => t.status === "fail")) return "has-fail";
  return "all-pass";
}

export function DevLogicPanel({ logicContent, rules, mappings }: DevLogicPanelProps) {
  const [contractExpanded, setContractExpanded] = useState(false);

  const rulesWithCoverage = rules.filter((r) => {
    const m = mappings.find((mp) => mp.ruleId === r.id);
    return m && m.tests.length > 0;
  });

  const coveragePercent = rules.length > 0
    ? Math.round((rulesWithCoverage.length / rules.length) * 100)
    : 0;

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
          Logic Verification
        </h2>
        <p className="text-xs text-text-muted mt-1">
          L5 logic contract -- state machine, business rules, and test-to-rule traceability
        </p>
      </motion.div>

      {/* L5 Logic Contract — collapsible */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner">
          <button
            onClick={() => setContractExpanded(!contractExpanded)}
            className="w-full flex items-center gap-2.5 p-5 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-accent"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 2v4l2 2M8 6L6 8M4 12h8M3 14h10"
              />
              <circle cx="8" cy="6" r="4" />
            </svg>
            <h3 className="text-sm font-medium text-text-primary tracking-tight">
              Logic Contract
            </h3>
            <span className="text-[10px] font-mono text-text-ghost bg-surface-2 px-2 py-0.5 rounded-full">
              L5
            </span>
            <span className="text-[10px] font-mono text-text-muted ml-auto mr-3">
              tests/contracts/*/logic_contract.md
            </span>
            <svg
              className={[
                "w-3.5 h-3.5 text-text-muted transition-transform duration-200",
                contractExpanded ? "rotate-180" : "",
              ].join(" ")}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
            </svg>
          </button>
          <AnimatePresence>
            {contractExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 max-h-[60vh] overflow-y-auto">
                  <MarkdownRenderer content={logicContent} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Rule Verification Table */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <svg
              className="w-4 h-4 text-accent"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h10v10H3zM3 7h10M7 7v6"
              />
            </svg>
            <h3 className="text-sm font-medium text-text-primary tracking-tight">
              Rule Verification Matrix
            </h3>
          </div>

          {/* Coverage summary — prominent stat at top */}
          <div className="mb-5">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-mono tabular-nums text-text-primary">
                {rulesWithCoverage.length}
                <span className="text-sm text-text-muted font-sans">
                  {" of "}
                </span>
                {rules.length}
                <span className="text-sm text-text-muted font-sans">
                  {" rules have test coverage"}
                </span>
              </span>
              <span className="text-xs font-mono text-text-muted tabular-nums">
                {coveragePercent}% verified
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${coveragePercent}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border w-20">
                    Rule ID
                  </th>
                  <th className="text-left font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border">
                    Rule
                  </th>
                  <th className="text-left font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border">
                    Tests
                  </th>
                  <th className="text-center font-medium text-text-primary bg-surface-2 px-4 py-3 border border-border w-20">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping) => {
                  const rule = rules.find((r) => r.id === mapping.ruleId);
                  const status = getRuleVerificationStatus(mapping.ruleId, mappings);
                  const isUntested = status === "untested";

                  return (
                    <tr
                      key={mapping.ruleId}
                      className={isUntested ? "bg-fail/5" : ""}
                    >
                      <td
                        className={[
                          "font-mono text-text-muted px-4 py-3 border border-border align-top",
                          isUntested ? "border-l-2 border-l-fail/40" : "",
                        ].join(" ")}
                      >
                        {mapping.ruleId}
                      </td>
                      <td className="text-text-secondary px-4 py-3 border border-border align-top">
                        <span className="font-medium text-text-primary">
                          {mapping.ruleName}
                        </span>
                        {rule && (
                          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                            {rule.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 border border-border align-top">
                        {mapping.tests.length === 0 ? (
                          <span className="text-[11px] text-fail/60 font-mono">
                            No tests mapped
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {mapping.tests.map((test) => (
                              <div
                                key={test.name}
                                className="flex items-center gap-2 text-[10px] font-mono leading-relaxed"
                              >
                                <span className="text-text-secondary truncate max-w-[220px]">
                                  {test.name}
                                </span>
                                <span
                                  className={`shrink-0 px-1.5 py-0.5 rounded ${LAYER_COLORS[test.layer]}`}
                                >
                                  {test.layer}
                                </span>
                                <span className={`shrink-0 ${STATUS_COLORS[test.status]}`}>
                                  {test.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 border border-border align-middle text-center">
                        <div className="flex justify-center">
                          <StatusIcon status={status} />
                        </div>
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
