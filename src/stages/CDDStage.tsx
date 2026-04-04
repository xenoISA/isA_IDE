import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CDDOutputs, CDDLayer } from "@/lib/types";
import { CDD_LAYERS } from "@/lib/types";
import { MOCK_CDD_CONTENT } from "@/lib/mock-data";
import { LayerContent } from "@/components/cdd/LayerContent";

interface CDDStageProps {
  outputs: CDDOutputs;
  gateComplete: boolean;
  mode?: "demo" | "live";
}

/** Map 0-6 completed layers to Tailwind width classes */
const PROGRESS_WIDTH: Record<number, string> = {
  0: "w-0",
  1: "w-1/6",
  2: "w-2/6",
  3: "w-3/6",
  4: "w-4/6",
  5: "w-5/6",
  6: "w-full",
};

export function CDDStage({ outputs, gateComplete, mode = "demo" }: CDDStageProps) {
  const [expandedLayer, setExpandedLayer] = useState<CDDLayer | null>(null);

  const completedCount = CDD_LAYERS.filter(
    (l) => outputs[l.key] !== null
  ).length;

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl tracking-tight font-medium text-text-primary">
            Contracts
          </h2>
          <p className="text-xs text-text-muted mt-1">
            <span className="font-mono tabular-nums text-text-secondary">
              {completedCount}
            </span>
            <span className="mx-1">/</span>
            <span className="font-mono tabular-nums">6</span>
            {" "}layers generated
          </p>
        </div>

        {/* Gate badge */}
        <span
          className={`
            px-3 py-1 rounded-[--radius-button] text-xs font-medium border
            ${gateComplete
              ? "border-accent/30 text-accent bg-accent-dim"
              : "border-border text-text-muted bg-surface-1"
            }
          `}
        >
          {gateComplete ? "Complete" : "In Progress"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-surface-2 rounded-full mb-8">
        <motion.div
          className={`h-full rounded-full bg-accent ${PROGRESS_WIDTH[completedCount]}`}
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / 6) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Layer accordion */}
      <div className="space-y-2">
        {CDD_LAYERS.map((layer, index) => {
          const filePath = outputs[layer.key];
          const isComplete = filePath !== null;
          const isExpanded = expandedLayer === layer.key;

          return (
            <motion.div
              key={layer.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="bezel"
            >
              <div className="bezel-inner">
                {/* Layer header */}
                <motion.button
                  onClick={() =>
                    setExpandedLayer(isExpanded ? null : layer.key)
                  }
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer"
                >
                  {/* Level badge */}
                  <span
                    className={`
                      w-7 h-7 rounded-[--radius-button] flex items-center justify-center
                      text-[10px] font-bold font-mono shrink-0
                      ${isComplete
                        ? "bg-accent-dim text-accent"
                        : "bg-surface-2 text-text-muted"
                      }
                    `}
                  >
                    {layer.level}
                  </span>

                  {/* Label + file path */}
                  <div className="text-left flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        isComplete ? "text-text-primary" : "text-text-muted"
                      }`}
                    >
                      {layer.label}
                    </p>
                    {filePath && (
                      <p className="text-[11px] text-text-muted font-mono truncate mt-0.5">
                        {filePath}
                      </p>
                    )}
                  </div>

                  {/* Status icon */}
                  <div className="shrink-0">
                    {isComplete ? (
                      <svg
                        className="w-4.5 h-4.5 text-accent"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4.5 h-4.5 text-text-muted/40"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <circle cx="10" cy="10" r="7.25" />
                      </svg>
                    )}
                  </div>

                  {/* Chevron */}
                  <motion.svg
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 text-text-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border">
                        {isComplete ? (
                          <LayerContent
                            layer={layer.key}
                            content={
                              mode === "demo"
                                ? MOCK_CDD_CONTENT[layer.key]
                                : ""
                            }
                            loading={mode === "live" && !MOCK_CDD_CONTENT[layer.key]}
                          />
                        ) : (
                          <p className="text-xs text-text-muted py-4">
                            Waiting for Product Team to generate this layer...
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
