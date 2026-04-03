import { useState } from "react";
import type { CDDOutputs, CDDLayer } from "@/lib/types";
import { CDD_LAYERS } from "@/lib/types";
import { MOCK_CDD_CONTENT } from "@/lib/mock-data";
import { LayerContent } from "@/components/cdd/LayerContent";

interface CDDStageProps {
  outputs: CDDOutputs;
  gateComplete: boolean;
  mode?: "demo" | "live";
}

export function CDDStage({ outputs, gateComplete, mode = "demo" }: CDDStageProps) {
  const [expandedLayer, setExpandedLayer] = useState<CDDLayer | null>(null);

  const completedCount = CDD_LAYERS.filter(
    (l) => outputs[l.key] !== null
  ).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Contract-Driven Development
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            {completedCount}/6 layers generated
          </p>
        </div>

        {/* Gate badge */}
        <div
          className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${gateComplete
              ? "bg-gate-complete/15 text-gate-complete"
              : "bg-surface-2 text-text-muted"
            }
          `}
        >
          {gateComplete ? "CDD Complete" : "In Progress"}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-surface-2 rounded-full mb-6">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(completedCount / 6) * 100}%`,
            background: gateComplete
              ? "var(--color-gate-complete)"
              : "var(--color-stage-cdd)",
          }}
        />
      </div>

      {/* Layer accordion */}
      <div className="space-y-2">
        {CDD_LAYERS.map((layer) => {
          const filePath = outputs[layer.key];
          const isComplete = filePath !== null;
          const isExpanded = expandedLayer === layer.key;

          return (
            <div
              key={layer.key}
              className={`
                rounded-lg border transition-colors
                ${isComplete ? "border-border bg-surface-1" : "border-border-subtle bg-surface-1/50"}
              `}
            >
              {/* Layer header */}
              <button
                onClick={() =>
                  setExpandedLayer(isExpanded ? null : layer.key)
                }
                className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer"
              >
                {/* Status indicator */}
                <div
                  className={`
                    w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shrink-0
                    ${isComplete
                      ? "bg-stage-cdd/20 text-stage-cdd"
                      : "bg-surface-2 text-text-muted"
                    }
                  `}
                >
                  {layer.level}
                </div>

                {/* Label */}
                <div className="text-left flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isComplete ? "text-text-primary" : "text-text-muted"
                    }`}
                  >
                    {layer.label}
                  </p>
                  {filePath && (
                    <p className="text-[10px] text-text-muted font-mono truncate">
                      {filePath}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isComplete
                      ? "bg-pass/15 text-pass"
                      : "bg-surface-2 text-text-muted"
                  }`}
                >
                  {isComplete ? "Ready" : "Pending"}
                </span>

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-text-muted transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
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
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border-subtle">
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
                    <p className="text-xs text-text-muted py-3">
                      Waiting for Product Team to generate this layer...
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
