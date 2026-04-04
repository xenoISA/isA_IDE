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

/** Maps section keys to their relevant gate indicator */
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
      className="absolute -top-1 -right-1"
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
    <nav className="mx-3 mt-2 mb-1">
      <div className="glass rounded-[var(--radius-outer)] px-4 py-2 flex items-center gap-1">
        {/* Logo */}
        <span className="text-sm font-medium tracking-wide text-text-secondary mr-5 select-none flex items-center gap-1.5">
          isA
          <span className="text-border text-text-muted/30 font-light select-none">|</span>
          <span className="text-text-muted">IDE</span>
        </span>

        {/* Section buttons */}
        <div className="flex items-center gap-0.5">
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
                  "relative px-4 py-1.5 rounded-[var(--radius-button)] text-xs font-medium",
                  "cursor-pointer transition-colors duration-150",
                  isActive
                    ? "bg-accent-dim text-accent border border-border-accent"
                    : "text-text-muted hover:text-text-secondary hover:bg-white/[0.04] border border-transparent",
                ].join(" ")}
              >
                {section.label}

                {gateKey && <GateDot complete={gateComplete ?? false} />}
              </motion.button>
            );
          })}
        </div>

        {/* Right side: running indicator + persona badge */}
        <div className="ml-auto flex items-center gap-3">
          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-text-secondary">Running</span>
            </div>
          )}

          <span className="text-[11px] font-medium text-text-muted tracking-wide select-none">
            {config.label}
          </span>
        </div>
      </div>
    </nav>
  );
}
