import { motion } from "framer-motion";
import type { HealthCheck } from "@/lib/mock-ops-data";

interface OpsHealthPanelProps {
  checks: HealthCheck[];
  healthResponse: string;
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

/* ─── Syntax-like coloring for JSON response ───────────────── */

function colorizeResponse(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    // HTTP method line
    if (/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s/.test(line)) {
      return (
        <span key={i}>
          <span className="text-accent">{line}</span>
          {"\n"}
        </span>
      );
    }

    // Comment-style lines
    if (/^Returns\s/.test(line)) {
      return (
        <span key={i}>
          <span className="text-text-ghost">{line}</span>
          {"\n"}
        </span>
      );
    }

    // JSON keys
    const keyMatch = line.match(/^(\s*)"([^"]+)"(\s*:\s*)/);
    if (keyMatch) {
      const [, indent, key, colon] = keyMatch;
      const rest = line.slice(keyMatch[0].length);
      return (
        <span key={i}>
          {indent}
          <span className="text-info">{`"${key}"`}</span>
          <span className="text-text-ghost">{colon}</span>
          <span className="text-text-secondary">{rest}</span>
          {"\n"}
        </span>
      );
    }

    return (
      <span key={i}>
        <span className="text-text-secondary">{line}</span>
        {"\n"}
      </span>
    );
  });
}

/* ─── Component ─────────────────────────────────────────────── */

export function OpsHealthPanel({ checks, healthResponse }: OpsHealthPanelProps) {
  if (checks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No health checks defined yet.
        </p>
      </div>
    );
  }

  const criticalCount = checks.filter((c) => c.critical).length;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-primary tracking-tight mb-2">
          Health Checks
        </h2>
        <p className="text-lg font-mono tabular-nums text-text-primary tracking-tight">
          {criticalCount}
          <span className="text-text-muted">
            {" "}critical / {checks.length} total
          </span>
        </p>
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: check list */}
        <motion.div
          className="space-y-2"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {checks.map((check) => (
            <motion.div
              key={check.name}
              variants={item}
              className="px-4 py-3 rounded-[--radius-button] bg-surface-1 border border-border-subtle"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-sm font-medium text-text-primary">
                  {check.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ml-auto shrink-0 ${
                    check.critical
                      ? "bg-accent-dim text-accent"
                      : "bg-surface-2 text-text-muted"
                  }`}
                >
                  {check.critical ? "Critical" : "Optional"}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {check.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Right: response code block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <pre className="bg-surface-0 border border-border rounded-[--radius-button] px-5 py-4 font-mono text-xs leading-relaxed overflow-x-auto h-full">
            <code>{colorizeResponse(healthResponse)}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
