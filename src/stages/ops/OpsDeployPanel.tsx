import { motion } from "framer-motion";
import type { DeployCheckItem } from "@/lib/mock-ops-data";

interface OpsDeployPanelProps {
  checklist: DeployCheckItem[];
}

/* ─── Category labels ──────────────────────────────────────── */

const CATEGORY_LABELS: Record<DeployCheckItem["category"], string> = {
  container: "CONTAINER",
  orchestration: "ORCHESTRATION",
  ci: "CI / CD",
  monitoring: "MONITORING",
};

const CATEGORY_ORDER: DeployCheckItem["category"][] = [
  "container",
  "orchestration",
  "ci",
  "monitoring",
];

/* ─── Status icon SVGs ─────────────────────────────────────── */

function StatusIcon({ status }: { status: DeployCheckItem["status"] }) {
  if (status === "ready") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
        <path
          d="M4.5 8.5L7 11L11.5 5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-pass"
        />
      </svg>
    );
  }
  if (status === "missing") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
        <path
          d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-fail"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="8" r="3" fill="currentColor" className="text-warn" />
    </svg>
  );
}

/* ─── Stagger animation ────────────────────────────────────── */

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

/* ─── Component ─────────────────────────────────────────────── */

export function OpsDeployPanel({ checklist }: OpsDeployPanelProps) {
  if (checklist.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No deployment checklist defined yet.
        </p>
      </div>
    );
  }

  const readyCount = checklist.filter((c) => c.status === "ready").length;
  const ratio = checklist.length > 0 ? readyCount / checklist.length : 0;

  // Group by category
  const grouped = CATEGORY_ORDER.reduce<
    Record<DeployCheckItem["category"], DeployCheckItem[]>
  >(
    (acc, cat) => {
      acc[cat] = checklist.filter((c) => c.category === cat);
      return acc;
    },
    { container: [], orchestration: [], ci: [], monitoring: [] },
  );

  return (
    <div className="max-w-3xl">
      {/* Header + summary */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight mb-2">
          Deployment
        </h2>
        <p className="text-lg font-mono tabular-nums text-text-primary tracking-tight">
          {readyCount}
          <span className="text-text-muted"> of {checklist.length} ready</span>
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-1 rounded-full bg-surface-2 overflow-hidden max-w-xs">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>

      {/* Grouped checklist */}
      <motion.div
        className="space-y-5"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;

          return (
            <div key={cat}>
              {/* Category header */}
              <p className="text-[0.625rem] font-semibold tracking-widest uppercase text-text-ghost mb-2 px-1">
                {CATEGORY_LABELS[cat]}
              </p>

              <div className="space-y-1.5">
                {items.map((check) => (
                  <motion.div
                    key={check.name}
                    variants={item}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-[--radius-button] bg-surface-1 border border-border-subtle"
                  >
                    <StatusIcon status={check.status} />
                    <span className="text-sm text-text-primary font-medium">
                      {check.name}
                    </span>
                    {check.path && (
                      <span className="text-xs font-mono text-text-muted ml-auto truncate max-w-[16ch]">
                        {check.path}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
