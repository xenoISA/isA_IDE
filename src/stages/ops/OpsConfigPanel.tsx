import { motion } from "framer-motion";
import type { EnvVariable } from "@/lib/mock-ops-data";

interface OpsConfigPanelProps {
  variables: EnvVariable[];
}

/* ─── Lock icon SVG ────────────────────────────────────────── */

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <rect
        x="3"
        y="6"
        width="8"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-text-muted"
      />
      <path
        d="M5 6V4.5C5 3.39543 5.89543 2.5 7 2.5C8.10457 2.5 9 3.39543 9 4.5V6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-text-muted"
      />
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

export function OpsConfigPanel({ variables }: OpsConfigPanelProps) {
  if (variables.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No environment variables defined yet.
        </p>
      </div>
    );
  }

  // Sort: required first, then optional
  const sorted = [...variables].sort((a, b) => {
    if (a.required === b.required) return 0;
    return a.required ? -1 : 1;
  });

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight mb-2">
          Configuration
        </h2>
        <p className="text-lg font-mono tabular-nums text-text-primary tracking-tight">
          {variables.length}
          <span className="text-text-muted"> variables</span>
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
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Variable</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Default</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Description</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Required</th>
                <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Secret</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((v) => (
                <motion.tr
                  key={v.name}
                  variants={item}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-5 py-3 font-mono text-xs text-accent">
                    {v.name}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-text-secondary">
                    {v.secret ? (
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <LockIcon />
                        secret
                      </span>
                    ) : (
                      v.defaultValue || (
                        <span className="text-text-ghost">--</span>
                      )
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-text-secondary max-w-[22ch] truncate">
                    {v.description}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        v.required
                          ? "bg-accent-dim text-accent"
                          : "bg-surface-2 text-text-muted"
                      }`}
                    >
                      {v.required ? "Required" : "Optional"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {v.secret && (
                      <span className="flex items-center gap-1.5">
                        <LockIcon />
                      </span>
                    )}
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
