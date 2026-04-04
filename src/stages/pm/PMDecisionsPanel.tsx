import { motion } from "framer-motion";
import type { ArchDecision } from "@/lib/types";

interface PMDecisionsPanelProps {
  decisions: ArchDecision[];
}

/* ─── Stagger animation ─────────────────────────────────────── */

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Component ──────────────────────────────────────────────── */

export function PMDecisionsPanel({ decisions }: PMDecisionsPanelProps) {
  if (decisions.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No architecture decisions captured yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary tracking-tight mb-5">
        Decisions
      </h2>

      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {decisions.map((decision, idx) => (
          <motion.div key={idx} className="bezel" variants={item}>
            <div className="bezel-inner px-5 py-4">
              {/* Title */}
              <p className="text-sm font-medium text-text-primary mb-2">
                {decision.title}
              </p>

              {/* What: description */}
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                {decision.description}
              </p>

              {/* Why: rationale */}
              <div>
                <p className="text-[11px] uppercase tracking-widest text-text-ghost mb-1">
                  Rationale
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {decision.rationale}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
