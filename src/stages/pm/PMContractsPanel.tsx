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

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">
          Business Rules
        </h2>
        <span className="font-mono text-xs text-text-muted">
          {verifiedCount} of {rules.length} rules verified
        </span>
      </div>

      {/* Rule list */}
      <motion.div variants={container} initial="hidden" animate="show">
        {rules.map((rule, idx) => {
          const badge = STATUS_CONFIG[rule.status];

          return (
            <motion.div
              key={rule.id}
              variants={item}
              className={`flex items-start justify-between gap-4 py-3.5 px-1 ${
                idx < rules.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Left: ID + content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-mono text-[11px] text-text-ghost shrink-0">
                    {rule.id}
                  </span>
                  <span className="text-sm font-medium text-text-primary truncate">
                    {rule.title}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {rule.description}
                </p>
              </div>

              {/* Right: status badge */}
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${badge.className}`}
              >
                {badge.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
