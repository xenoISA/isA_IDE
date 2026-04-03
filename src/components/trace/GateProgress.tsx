import { motion } from "framer-motion";
import type { Gates } from "@/lib/types";

interface GateProgressProps {
  gates: Gates;
}

const GATE_ITEMS: { key: keyof Gates; label: string; stage: string }[] = [
  { key: "cdd_complete", label: "Contracts Ready", stage: "CDD" },
  { key: "tests_pass", label: "Tests Pass", stage: "TDD" },
  { key: "deploy_success", label: "Deployed", stage: "Ship" },
];

function CheckmarkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3 h-3">
      <path
        d="M13.5 4.5l-7 7L3 8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GateProgress({ gates }: GateProgressProps) {
  return (
    <div className="space-y-1">
      <span className="text-xs uppercase tracking-widest text-text-muted">
        Pipeline Gates
      </span>

      <div className="flex flex-col">
        {GATE_ITEMS.map((item, i) => {
          const complete = gates[item.key];
          const prevComplete = i > 0 ? gates[GATE_ITEMS[i - 1].key] : false;

          return (
            <div key={item.key}>
              {/* Connector above (except first) */}
              {i > 0 && (
                <div className="flex justify-start pl-[11px]">
                  <div
                    className={`w-px h-3 ${
                      prevComplete && complete
                        ? "bg-accent"
                        : "border-l border-dashed border-border"
                    }`}
                  />
                </div>
              )}

              {/* Gate row */}
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                    complete
                      ? "bg-accent text-bg"
                      : "border border-border text-text-muted"
                  }`}
                  initial={false}
                  animate={complete ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {complete ? <CheckmarkIcon /> : i + 1}
                </motion.div>

                <div>
                  <p
                    className={`text-xs font-medium ${
                      complete ? "text-accent" : "text-text-secondary"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-text-muted">{item.stage}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
