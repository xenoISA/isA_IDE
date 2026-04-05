import { motion } from "framer-motion";
import type { EdgeCase } from "@/lib/mock-test-data";


interface TestEdgeCasesPanelProps {
  edgeCases: EdgeCase[];
}

/* ─── SVG Icons ──────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-pass shrink-0">
      <path
        d="M13 4.5l-6.5 7L3 8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FailIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-fail shrink-0">
      <path
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Helpers ────────────────────────────────────────────────── */

function groupByRule(edgeCases: EdgeCase[]): Map<string, EdgeCase[]> {
  const groups = new Map<string, EdgeCase[]>();
  for (const ec of edgeCases) {
    const existing = groups.get(ec.ruleId) || [];
    existing.push(ec);
    groups.set(ec.ruleId, existing);
  }
  return groups;
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

// Rule name lookup from ruleId — derived from mock data convention
const RULE_NAMES: Record<string, string> = {
  "BR-001": "Retry Policy",
  "BR-002": "Channel Fallback",
  "BR-003": "Rate Limiting",
  "BR-004": "Template Validation",
  "BR-005": "Quiet Hours",
};

export function TestEdgeCasesPanel({ edgeCases }: TestEdgeCasesPanelProps) {
  const testedCount = edgeCases.filter((ec) => ec.tested).length;
  const grouped = groupByRule(edgeCases);

  if (edgeCases.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No edge cases cataloged yet. Run the pipeline to extract edge cases from logic contracts.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h2 className="text-xl tracking-tight font-medium text-text-primary">
          Edge Cases
        </h2>
        <p className="text-xs font-mono text-text-muted mt-1 tabular-nums">
          {testedCount} of {edgeCases.length} tested
        </p>
      </motion.div>

      {/* Grouped by rule */}
      {Array.from(grouped.entries()).map(([ruleId, cases]) => (
        <motion.div key={ruleId} variants={item} className="space-y-2">
          {/* Rule section header */}
          <div className="flex items-center gap-2.5 mb-1">
            <span className="font-mono text-xs text-text-muted bg-surface-2 px-2.5 py-1 rounded-full">
              {ruleId}
            </span>
            <span className="text-sm font-medium text-text-primary tracking-tight">
              {RULE_NAMES[ruleId] || ruleId}
            </span>
          </div>

          {/* Edge case checklist */}
          {cases.map((ec) => (
            <div
              key={ec.id}
              className={[
                "bezel overflow-hidden",
                !ec.tested ? "" : "",
              ].join(" ")}
            >
              <div
                className={[
                  "bezel-inner px-5 py-3 flex items-start gap-3",
                  !ec.tested ? "bg-fail/5" : "",
                ].join(" ")}
              >
                {/* Status icon */}
                <div className="mt-0.5">
                  {ec.tested ? <CheckIcon /> : <FailIcon />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-text-ghost bg-surface-2 px-2 py-0.5 rounded-full">
                      {ec.id}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {ec.description}
                  </p>
                  {ec.tested && ec.testFunction ? (
                    <span className="text-[10px] font-mono text-accent-muted mt-1 block">
                      {ec.testFunction}
                    </span>
                  ) : !ec.tested ? (
                    <span className="text-[10px] font-mono text-fail/60 mt-1 block">
                      Not tested
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}
