import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface DevArchitecturePanelProps {
  designContent: string;
  systemContent: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

type ArchTab = "design" | "system";

const ARCH_TABS: { key: ArchTab; label: string; level: string; path: string }[] = [
  { key: "design", label: "System Design", level: "L3", path: "docs/design/*.md" },
  { key: "system", label: "System Contract", level: "L6", path: "tests/contracts/*/system_contract.md" },
];

function SectionIcon({ variant }: { variant: "design" | "system" }) {
  if (variant === "design") {
    return (
      <svg
        className="w-4 h-4 text-accent"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="2" y="2" width="12" height="12" rx="2" strokeLinecap="round" />
        <path d="M2 6h12M6 6v8" strokeLinecap="round" />
      </svg>
    );
  }
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
        d="M8 2v2M8 12v2M2 8h2M12 8h2M4.5 4.5l1 1M10.5 10.5l1 1M4.5 11.5l1-1M10.5 5.5l1-1"
      />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

export function DevArchitecturePanel({ designContent, systemContent }: DevArchitecturePanelProps) {
  const [activeTab, setActiveTab] = useState<ArchTab>("design");

  const contentMap: Record<ArchTab, string> = {
    design: designContent,
    system: systemContent,
  };

  const currentTabMeta = ARCH_TABS.find((t) => t.key === activeTab)!;

  return (
    <motion.div
      className="max-w-3xl space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h2 className="text-xl tracking-tight font-medium text-text-primary">
          Architecture
        </h2>
        <p className="text-xs text-text-muted mt-1">
          L3 system design and L6 system contract -- component topology, schemas, and integration boundaries
        </p>
      </motion.div>

      {/* Tabbed content */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {ARCH_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "relative flex-1 px-3 py-2.5 text-xs font-medium cursor-pointer",
                  "transition-colors duration-150",
                  activeTab === tab.key
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary",
                ].join(" ")}
              >
                <span className="flex items-center justify-center gap-2">
                  <SectionIcon variant={tab.key} />
                  {tab.label}
                  <span className="text-[10px] font-mono text-text-ghost bg-surface-2 px-1.5 py-0.5 rounded-full">
                    {tab.level}
                  </span>
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="arch-tab-indicator"
                    className="absolute bottom-0 left-3 right-3 h-px bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            <div className="flex items-center justify-end mb-4">
              <span className="text-[10px] font-mono text-text-muted">
                {currentTabMeta.path}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <MarkdownRenderer
                  content={contentMap[activeTab]}
                  className="[&_table]:text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
