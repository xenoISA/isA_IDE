import { motion } from "framer-motion";
import type { UserStory, BusinessRule, Gates } from "@/lib/types";

interface PMProgressPanelProps {
  stories: UserStory[];
  rules: BusinessRule[];
  gates: Gates;
  handoffNotes: Record<string, string>;
}

/* ─── Gate config ────────────────────────────────────────────── */

const GATE_ITEMS: { key: keyof Gates; label: string }[] = [
  { key: "cdd_complete", label: "Contracts Ready" },
  { key: "tests_pass", label: "Tests Passing" },
  { key: "deploy_success", label: "Deployed" },
];

/* ─── Team label mapping (plain English) ─────────────────────── */

const TEAM_LABELS: Record<string, string> = {
  product_team: "Product Team",
  dev_team: "Development Team",
  ops_team: "Operations Team",
  test_team: "Testing Team",
};

/* ─── SVG Icons ──────────────────────────────────────────────── */

function GateCheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3 h-3">
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

function GateLockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3 h-3">
      <rect
        x="4"
        y="7"
        width="8"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M6 7V5a2 2 0 1 1 4 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Stagger animation ─────────────────────────────────────── */

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Component ──────────────────────────────────────────────── */

export function PMProgressPanel({
  stories,
  rules,
  gates,
  handoffNotes,
}: PMProgressPanelProps) {
  /* Compute metrics */
  const allCriteria = stories.flatMap((s) => s.criteria);
  const passingCriteria = allCriteria.filter((c) => c.status === "pass").length;
  const totalCriteria = allCriteria.length;

  const verifiedRules = rules.filter((r) => r.status === "verified").length;
  const totalRules = rules.length;

  const completedGates = GATE_ITEMS.filter((g) => gates[g.key]).length;
  const totalGates = GATE_ITEMS.length;

  const hasData = totalCriteria > 0 || totalRules > 0;
  const hasNotes = Object.keys(handoffNotes).length > 0;

  if (!hasData && !hasNotes) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          Run the pipeline to see progress.
        </p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* ─── Hero stats row ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-8 mb-10">
        <motion.div variants={item}>
          <p className="font-mono text-3xl text-text-primary tracking-tight">
            {passingCriteria}
            <span className="text-text-ghost text-lg"> of {totalCriteria}</span>
          </p>
          <p className="text-xs text-text-muted mt-1">
            Acceptance Criteria Passing
          </p>
        </motion.div>

        <motion.div variants={item}>
          <p className="font-mono text-3xl text-text-primary tracking-tight">
            {verifiedRules}
            <span className="text-text-ghost text-lg"> of {totalRules}</span>
          </p>
          <p className="text-xs text-text-muted mt-1">
            Business Rules Verified
          </p>
        </motion.div>

        <motion.div variants={item}>
          <p className="font-mono text-3xl text-text-primary tracking-tight">
            {completedGates}
            <span className="text-text-ghost text-lg"> of {totalGates}</span>
          </p>
          <p className="text-xs text-text-muted mt-1">
            Pipeline Gates Cleared
          </p>
        </motion.div>
      </div>

      {/* ─── Gate timeline (horizontal) ─────────────────────── */}
      <motion.div variants={item} className="mb-10">
        <p className="text-xs uppercase tracking-widest text-text-muted mb-3">
          Gate Progress
        </p>
        <div className="flex items-center gap-0">
          {GATE_ITEMS.map((gate, i) => {
            const complete = gates[gate.key];
            return (
              <div key={gate.key} className="flex items-center">
                {/* Connector line (except before first) */}
                {i > 0 && (
                  <div
                    className={`w-12 h-px ${
                      gates[GATE_ITEMS[i - 1].key] && complete
                        ? "bg-accent"
                        : "border-t border-dashed border-border"
                    }`}
                  />
                )}

                {/* Gate node */}
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      complete
                        ? "bg-accent text-bg"
                        : "border border-border text-text-muted"
                    }`}
                    initial={false}
                    animate={complete ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {complete ? <GateCheckIcon /> : <GateLockIcon />}
                  </motion.div>
                  <span
                    className={`text-[11px] whitespace-nowrap ${
                      complete
                        ? "text-accent font-medium"
                        : "text-text-muted"
                    }`}
                  >
                    {gate.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Handoff notes ──────────────────────────────────── */}
      {hasNotes && (
        <motion.div variants={item}>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-3">
            Team Notes
          </p>
          <div className="space-y-4">
            {Object.entries(handoffNotes).map(([team, note]) => (
              <div key={team}>
                <p className="text-[11px] font-medium text-text-muted mb-1">
                  {TEAM_LABELS[team] || team}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
