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
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
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
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
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

/* ─── Stat Card ─────────────────────────────────────────────── */

function StatCard({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label: string;
}) {
  const ratio = total > 0 ? value / total : 0;

  return (
    <motion.div variants={item}>
      <p className="font-mono tabular-nums tracking-tight">
        <span className="text-5xl font-semibold text-text-primary">{value}</span>
        <span className="text-lg text-text-muted"> of {total}</span>
      </p>
      <p className="text-xs uppercase tracking-widest text-text-muted mt-2">
        {label}
      </p>
      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
}

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
    <motion.div
      className="max-w-3xl space-y-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ─── Hero stats row ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-8">
        <StatCard
          value={passingCriteria}
          total={totalCriteria}
          label="Acceptance Criteria Passing"
        />
        <StatCard
          value={verifiedRules}
          total={totalRules}
          label="Business Rules Verified"
        />
        <StatCard
          value={completedGates}
          total={totalGates}
          label="Pipeline Gates Cleared"
        />
      </div>

      {/* ─── Gate timeline (horizontal) ─────────────────────── */}
      <motion.div variants={item}>
        <p className="text-xs uppercase tracking-widest text-text-muted mb-4">
          Gate Progress
        </p>
        <div className="flex items-start gap-0">
          {GATE_ITEMS.map((gate, i) => {
            const complete = gates[gate.key];
            return (
              <div key={gate.key} className="flex items-start">
                {/* Connector line (except before first) */}
                {i > 0 && (
                  <div
                    className={`w-16 h-0.5 mt-4 ${
                      gates[GATE_ITEMS[i - 1].key] && complete
                        ? "bg-accent"
                        : "border-t-2 border-dashed border-border"
                    }`}
                  />
                )}

                {/* Gate node */}
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      complete
                        ? "bg-accent text-bg"
                        : "border-2 border-border text-text-muted"
                    }`}
                    initial={false}
                    animate={complete ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {complete ? <GateCheckIcon /> : <GateLockIcon />}
                  </motion.div>
                  <span
                    className={`text-xs whitespace-nowrap ${
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
          <p className="text-xs uppercase tracking-widest text-text-muted mb-4">
            Team Notes
          </p>
          <div className="space-y-3">
            {Object.entries(handoffNotes).map(([team, note]) => (
              <div key={team} className="bezel">
                <div className="bezel-inner px-5 py-4">
                  <span className="inline-block text-[11px] font-medium text-accent bg-accent-dim rounded-[--radius-button] px-2.5 py-0.5 mb-2">
                    {TEAM_LABELS[team] || team}
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
