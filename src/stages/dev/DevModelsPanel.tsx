import { useState } from "react";
import { motion } from "framer-motion";
import type { DataModel } from "@/lib/types";
import { LayerContent } from "@/components/cdd/LayerContent";

interface DevModelsPanelProps {
  models: DataModel[];
  dataContractContent: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function ModelIcon() {
  return (
    <svg
      className="w-4 h-4 text-accent"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4h10M3 8h10M3 12h10"
      />
      <circle cx="5" cy="4" r="0.5" fill="currentColor" />
      <circle cx="5" cy="8" r="0.5" fill="currentColor" />
      <circle cx="5" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

function ModelTable({ model }: { model: DataModel }) {
  return (
    <motion.div
      variants={item}
      className="bezel"
    >
      <div className="bezel-inner p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <ModelIcon />
          <h3 className="text-sm font-medium text-text-primary tracking-tight font-mono">
            {model.name}
          </h3>
          <span className="text-[10px] font-mono text-text-ghost bg-surface-2 px-2 py-0.5 rounded-full">
            {model.fields.length} fields
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left font-medium text-text-primary bg-surface-2 px-3 py-2 border border-border">
                  Field
                </th>
                <th className="text-left font-medium text-text-primary bg-surface-2 px-3 py-2 border border-border">
                  Type
                </th>
                <th className="text-left font-medium text-text-primary bg-surface-2 px-3 py-2 border border-border">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {model.fields.map((field) => (
                <tr key={field.name}>
                  <td className="font-mono text-accent px-3 py-2 border border-border">
                    {field.name}
                  </td>
                  <td className="font-mono text-info px-3 py-2 border border-border">
                    {field.type}
                  </td>
                  <td className="text-text-secondary px-3 py-2 border border-border">
                    {field.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

export function DevModelsPanel({ models, dataContractContent }: DevModelsPanelProps) {
  const [view, setView] = useState<"structured" | "raw">("structured");

  return (
    <motion.div
      className="max-w-4xl space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl tracking-tight font-medium text-text-primary">
            Data Models
          </h2>
          <p className="text-xs text-text-muted mt-1">
            L4 data contract -- Pydantic models, field types, and validation constraints
          </p>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center bg-surface-2 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setView("structured")}
            className={`
              px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer
              ${view === "structured"
                ? "bg-surface-1 text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
              }
            `}
          >
            Structured
          </button>
          <button
            onClick={() => setView("raw")}
            className={`
              px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer
              ${view === "raw"
                ? "bg-surface-1 text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
              }
            `}
          >
            Raw Contract
          </button>
        </div>
      </motion.div>

      {/* Structured view */}
      {view === "structured" && (
        <motion.div
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
          key="structured"
        >
          {models.map((model) => (
            <ModelTable key={model.name} model={model} />
          ))}

          {/* Summary */}
          <motion.div variants={item} className="flex items-center gap-3 pt-2">
            <span className="text-[11px] text-text-muted">
              <span className="font-mono text-text-secondary">{models.length}</span> model{models.length !== 1 ? "s" : ""}
              {" / "}
              <span className="font-mono text-text-secondary">
                {models.reduce((acc, m) => acc + m.fields.length, 0)}
              </span> total fields
            </span>
            <span className="text-[10px] font-mono text-text-ghost ml-auto">
              tests/contracts/*/data_contract.py
            </span>
          </motion.div>
        </motion.div>
      )}

      {/* Raw view */}
      {view === "raw" && (
        <motion.div
          key="raw"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bezel">
            <div className="bezel-inner p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <svg
                  className="w-4 h-4 text-info"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5"
                  />
                </svg>
                <h3 className="text-sm font-medium text-text-primary tracking-tight">
                  L4 Data Contract
                </h3>
                <span className="text-[10px] font-mono text-text-ghost bg-surface-2 px-2 py-0.5 rounded-full">
                  Python / Pydantic v2
                </span>
              </div>
              <LayerContent layer="data_contract" content={dataContractContent} />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
