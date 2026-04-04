import { motion } from "framer-motion";
import type { BusinessRule } from "@/lib/types";

interface PMContractsPanelProps {
  rules: BusinessRule[];
}

/* ─── Status badge config ────────────────────────────────────── */

const STATUS_CONFIG: Record<
  BusinessRule["status"],
  { label: string; className: string }
> = {
  verified: {
    label: "Verified",
    className: "text-pass border-pass/30",
  },
  pending: {
    label: "Pending",
    className: "text-warn border-warn/30",
  },
  failed: {
    label: "Failed",
    className: "text-fail border-fail/30",
  },
};

/* ─── Stagger animation ─────────────────────────────────────── */

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

/* ─── Component ──────────────────────────────────────────────── */

export function PMContractsPanel({ rules }: PMContractsPanelProps) {
  if (rules.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No business rules captured yet. Run the pipeline to extract rules from
          your contracts.
        </p>
      </div>
    );
  }

  const verifiedCount = rules.filter((r) => r.status === "verified").length;
  const ratio = rules.length > 0 ? verifiedCount / rules.length : 0;

  return (
    <div className="max-w-3xl">
      {/* Header + summary */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight mb-2">
          Business Rules
        </h2>
        <p className="text-lg font-mono tabular-nums text-text-primary tracking-tight">
          {verifiedCount}
          <span className="text-text-muted"> of {rules.length} rules verified</span>
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

      {/* Rule list */}
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {rules.map((rule) => {
          const badge = STATUS_CONFIG[rule.status];

          return (
            <motion.div key={rule.id} variants={item} className="bezel">
              <div className="bezel-inner px-5 py-4">
                {/* Header row: ID pill + title + status badge */}
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="bg-accent-dim text-accent rounded-[--radius-button] px-2 py-0.5 text-xs font-mono shrink-0">
                    {rule.id}
                  </span>
                  <span className="text-base font-medium text-text-primary truncate">
                    {rule.title}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 ml-auto ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary leading-relaxed max-w-[65ch]">
                  {rule.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
