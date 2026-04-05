import { motion } from "framer-motion";
import type { InfraRequirement } from "@/lib/mock-ops-data";

interface OpsInfraPanelProps {
  requirements: InfraRequirement[];
}

/* ─── Type badge config ────────────────────────────────────── */

const TYPE_CLASSES: Record<string, string> = {
  database: "bg-accent-dim text-accent",
  cache: "bg-accent-dim text-accent",
  messaging: "bg-accent-dim text-accent",
  "object-storage": "bg-surface-2 text-text-secondary",
  "graph-db": "bg-surface-2 text-text-secondary",
};

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

export function OpsInfraPanel({ requirements }: OpsInfraPanelProps) {
  if (requirements.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No infrastructure requirements defined yet.
        </p>
      </div>
    );
  }

  const requiredCount = requirements.filter((r) => r.required).length;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight mb-2">
          Infrastructure
        </h2>
        <p className="text-lg font-mono tabular-nums text-text-primary tracking-tight">
          {requiredCount}
          <span className="text-text-muted"> required services</span>
        </p>
      </div>

      {/* Table */}
      <motion.div
        className="bezel"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="bezel-inner overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Service</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Port</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Required</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => (
                <motion.tr
                  key={req.service}
                  variants={item}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-5 py-3 text-text-primary font-medium">
                    {req.service}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        TYPE_CLASSES[req.type] || "bg-surface-2 text-text-secondary"
                      }`}
                    >
                      {req.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono tabular-nums text-text-secondary">
                    {req.port}
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          req.required ? "bg-accent" : "bg-surface-3"
                        }`}
                      />
                      <span className="text-xs text-text-muted">
                        {req.required ? "Required" : "Optional"}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary text-xs max-w-[20ch] truncate">
                    {req.notes}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
