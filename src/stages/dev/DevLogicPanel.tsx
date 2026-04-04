import { motion } from "framer-motion";
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

function StatusIcon({ status }: { status: "all-pass" | "has-fail" | "untested" }) {
  if (status === "all-pass") {
    return (
      <svg
        className="w-4 h-4 text-accent"
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
        className="w-4 h-4 text-fail"
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

function getTestStatusPillClasses(status: "pass" | "fail" | "skip"): string {
  if (status === "pass") return "text-accent bg-accent-dim";
  if (status === "fail") return "text-fail bg-fail/10";
  return "text-text-muted bg-surface-2";
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
  const rulesWithCoverage = rules.filter((r) => {
    const m = mappings.find((m) => m.ruleId === r.id);
    return m && m.tests.length > 0;
  });

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

      {/* L5 Logic Contract */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner p-5">
          <div className="flex items-center gap-2.5 mb-4">
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
            <span className="text-[10px] font-mono text-text-muted ml-auto">
              tests/contracts/*/logic_contract.md
            </span>
          </div>
          <MarkdownRenderer content={logicContent} />
        </div>
      </motion.div>

      {/* Rule Verification Table */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner p-5">
          <div className="flex items-center gap-2.5 mb-4">
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

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left font-medium text-text-primary bg-surface-2 px-3 py-2.5 border border-border w-20">
                    Rule ID
                  </th>
                  <th className="text-left font-medium text-text-primary bg-surface-2 px-3 py-2.5 border border-border">
                    Rule
                  </th>
                  <th className="text-left font-medium text-text-primary bg-surface-2 px-3 py-2.5 border border-border">
                    Tests
                  </th>
                  <th className="text-center font-medium text-text-primary bg-surface-2 px-3 py-2.5 border border-border w-20">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping) => {
                  const rule = rules.find((r) => r.id === mapping.ruleId);
                  const status = getRuleVerificationStatus(mapping.ruleId, mappings);

                  return (
                    <tr key={mapping.ruleId}>
                      <td className="font-mono text-text-muted px-3 py-3 border border-border align-top">
                        {mapping.ruleId}
                      </td>
                      <td className="text-text-secondary px-3 py-3 border border-border align-top">
                        <span className="font-medium text-text-primary">
                          {mapping.ruleName}
                        </span>
                        {rule && (
                          <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                            {rule.description}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 border border-border align-top">
                        {mapping.tests.length === 0 ? (
                          <span className="text-[11px] text-text-ghost font-mono">
                            No tests mapped
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {mapping.tests.map((test) => (
                              <span
                                key={test.name}
                                className={`
                                  inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                                  text-[10px] font-mono
                                  ${getTestStatusPillClasses(test.status)}
                                `}
                              >
                                {test.name}
                                <span className={`text-[9px] ${LAYER_COLORS[test.layer]} px-1 rounded`}>
                                  {test.layer}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 border border-border align-middle text-center">
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

      {/* Summary */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                  d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"
                />
              </svg>
              <span className="text-sm text-text-secondary">
                <span className="font-mono font-medium text-text-primary tabular-nums">
                  {rulesWithCoverage.length}
                </span>
                {" of "}
                <span className="font-mono font-medium text-text-primary tabular-nums">
                  {rules.length}
                </span>
                {" rules have test coverage"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-text-ghost">
              {Math.round((rulesWithCoverage.length / rules.length) * 100)}% verified
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
