import { motion } from "framer-motion";
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
  return (
    <motion.div
      className="max-w-4xl space-y-6"
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

      {/* L3 System Design */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <SectionIcon variant="design" />
            <h3 className="text-sm font-medium text-text-primary tracking-tight">
              System Design
            </h3>
            <span className="text-[10px] font-mono text-text-ghost bg-surface-2 px-2 py-0.5 rounded-full">
              L3
            </span>
            <span className="text-[10px] font-mono text-text-muted ml-auto">
              docs/design/*.md
            </span>
          </div>
          <MarkdownRenderer content={designContent} />
        </div>
      </motion.div>

      {/* L6 System Contract */}
      <motion.div variants={item} className="bezel">
        <div className="bezel-inner p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <SectionIcon variant="system" />
            <h3 className="text-sm font-medium text-text-primary tracking-tight">
              System Contract
            </h3>
            <span className="text-[10px] font-mono text-text-ghost bg-surface-2 px-2 py-0.5 rounded-full">
              L6
            </span>
            <span className="text-[10px] font-mono text-text-muted ml-auto">
              tests/contracts/*/system_contract.md
            </span>
          </div>
          <MarkdownRenderer content={systemContent} />
        </div>
      </motion.div>
    </motion.div>
  );
}
