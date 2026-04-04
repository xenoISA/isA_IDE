import { motion } from "framer-motion";
import type { Persona, Gates, PersonaSection } from "@/lib/types";
import { PERSONA_CONFIG } from "@/lib/types";

interface PersonaNavProps {
  persona: Persona;
  activeSection: string;
  onSectionChange: (section: string) => void;
  gates: Gates;
  isRunning: boolean;
}

const SECTION_GATE_MAP: Record<string, keyof Gates> = {
  contracts: "cdd_complete",
  results: "tests_pass",
};

function GateDot({ complete }: { complete: boolean }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className="absolute -top-0.5 -right-0.5"
      aria-hidden="true"
    >
      <circle
        cx="4"
        cy="4"
        r="3.5"
        className={
          complete
            ? "fill-accent stroke-accent/30"
            : "fill-surface-2 stroke-border"
        }
        strokeWidth="1"
      />
    </svg>
  );
}

export function PersonaNav({
  persona,
  activeSection,
  onSectionChange,
  gates,
  isRunning,
}: PersonaNavProps) {
  const config = PERSONA_CONFIG[persona];

  const allSections: { key: string; label: string }[] = [
    { key: "intent", label: "Intent" },
    ...config.sections.map((s: PersonaSection) => ({
      key: s.key,
      label: s.label,
    })),
  ];

  return (
    <nav className="mx-4 mt-3 mb-2">
      <div className="glass rounded-[var(--radius-outer)] ring-1 ring-white/[0.08] px-5 py-3 flex items-center">
        {/* Logo */}
        <span className="text-sm font-semibold tracking-wide text-text-primary mr-6 select-none flex items-center gap-2">
          isA
          <span className="text-text-muted/20 font-light">|</span>
          <span className="text-text-muted font-normal">IDE</span>
        </span>

        {/* Section buttons */}
        <div className="flex items-center gap-1.5">
          {allSections.map((section) => {
            const isActive = activeSection === section.key;
            const gateKey = SECTION_GATE_MAP[section.key];
            const gateComplete = gateKey ? gates[gateKey] : undefined;

            return (
              <motion.button
                key={section.key}
                onClick={() => onSectionChange(section.key)}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className={[
                  "relative px-3.5 py-1.5 rounded-[var(--radius-button)] text-[13px] font-medium",
                  "cursor-pointer transition-all duration-150",
                  isActive
                    ? "bg-accent/15 text-accent ring-1 ring-accent/25"
                    : "text-text-muted hover:text-text-secondary hover:bg-white/[0.05]",
                ].join(" ")}
              >
                {section.label}
                {gateKey && <GateDot complete={gateComplete ?? false} />}
              </motion.button>
            );
          })}
        </div>

        {/* Right: running + persona label */}
        <div className="ml-auto flex items-center gap-4">
          {isRunning && (
            <div className="flex items-center gap-2 text-xs text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-text-secondary">Running</span>
            </div>
          )}

          <span className="text-text-muted/15 select-none">|</span>
          <span className="text-[11px] font-medium text-text-muted/50 tracking-wider uppercase select-none">
            {config.label}
          </span>
        </div>
      </div>
    </nav>
  );
}
