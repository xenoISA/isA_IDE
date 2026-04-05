import { motion } from "framer-motion";
import type { GivenWhenThen } from "@/lib/mock-test-data";

interface TestScenariosPanelProps {
  scenarios: GivenWhenThen[];
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

function PendingIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-text-ghost shrink-0">
      <circle
        cx="8"
        cy="8"
        r="5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

/* ─── Helpers ────────────────────────────────────────────────── */

function statusIcon(status: GivenWhenThen["status"]) {
  if (status === "pass") return <CheckIcon />;
  if (status === "fail") return <FailIcon />;
  return <PendingIcon />;
}

function statusBorder(status: GivenWhenThen["status"]): string {
  if (status === "pass") return "border-l-[3px] border-l-accent";
  if (status === "fail") return "border-l-[3px] border-l-fail";
  return "border-l-[3px] border-l-border";
}

function statusBadge(status: GivenWhenThen["status"]): { label: string; className: string } {
  if (status === "pass") return { label: "Pass", className: "text-pass border-pass/30" };
  if (status === "fail") return { label: "Fail", className: "text-fail border-fail/30" };
  return { label: "Pending", className: "text-text-muted border-border" };
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

export function TestScenariosPanel({ scenarios }: TestScenariosPanelProps) {
  const passingCount = scenarios.filter((s) => s.status === "pass").length;

  if (scenarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No test scenarios generated yet. Run the pipeline to extract Given/When/Then scenarios.
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
          Scenarios
        </h2>
        <p className="text-xs font-mono text-text-muted mt-1 tabular-nums">
          {passingCount} of {scenarios.length} scenarios passing
        </p>
      </motion.div>

      {/* Scenario cards */}
      {scenarios.map((scenario) => {
        const badge = statusBadge(scenario.status);

        return (
          <motion.div
            key={scenario.id}
            className="bezel overflow-hidden"
            variants={item}
          >
            <div className={`bezel-inner px-5 py-4 relative ${statusBorder(scenario.status)}`}>
              {/* Header: ID pill + story ref + status */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-text-muted bg-surface-2 px-2.5 py-1 rounded-full">
                  {scenario.id}
                </span>
                <span className="font-mono text-[10px] text-text-ghost bg-surface-2 px-2 py-0.5 rounded-full">
                  {scenario.storyId}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badge.className}`}
                >
                  {badge.label}
                </span>
                <div className="ml-auto">
                  {statusIcon(scenario.status)}
                </div>
              </div>

              {/* Given / When / Then */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted">
                    Given
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed mt-0.5">
                    {scenario.given}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted">
                    When
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed mt-0.5">
                    {scenario.when}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted">
                    Then
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed mt-0.5">
                    {scenario.then}
                  </p>
                </div>
              </div>

              {/* Test function link */}
              {scenario.testFunction && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] font-mono text-accent-muted">
                    {scenario.testFunction}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
