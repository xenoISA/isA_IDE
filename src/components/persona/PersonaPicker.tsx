import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Persona } from "@/lib/types";
import { PERSONA_CONFIG } from "@/lib/types";

interface PersonaPickerProps {
  onSelect: (persona: Persona) => void;
}

const PERSONAS: { key: Persona; disabled: boolean }[] = [
  { key: "pm", disabled: false },
  { key: "dev", disabled: false },
  { key: "test", disabled: true },
  { key: "ops", disabled: true },
];

function PersonaIcon({ persona }: { persona: Persona }) {
  const cls = "w-8 h-8";

  switch (persona) {
    case "pm":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "dev":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="8 7 3 12 8 17" />
          <polyline points="16 7 21 12 16 17" />
        </svg>
      );
    case "test":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" />
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        </svg>
      );
    case "ops":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="4" rx="1" />
          <rect x="2" y="13" width="20" height="4" rx="1" />
          <circle cx="6" cy="9" r="0.5" fill="currentColor" />
          <circle cx="6" cy="15" r="0.5" fill="currentColor" />
        </svg>
      );
  }
}

const cardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function PersonaPicker({ onSelect }: PersonaPickerProps) {
  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
        {/* Ambient glow — two layered gradients for depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(52,211,153,0.08)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(52,211,153,0.04)_0%,transparent_70%)] blur-2xl" />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 w-full max-w-md mx-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <span className="text-lg font-semibold text-text-primary tracking-wide">isA</span>
            <span className="text-text-muted/20">|</span>
            <span className="text-lg font-normal text-text-muted tracking-wide">IDE</span>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-medium tracking-tight text-text-primary">
              How do you work?
            </h1>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              Same pipeline data, rendered for your role.
            </p>
          </div>

          {/* Persona cards — vertical stack, not grid */}
          <motion.div
            className="space-y-3"
            variants={cardStagger}
            initial="hidden"
            animate="show"
          >
            {PERSONAS.map(({ key, disabled }) => {
              const config = PERSONA_CONFIG[key];

              return (
                <motion.button
                  key={key}
                  variants={cardItem}
                  onClick={() => !disabled && onSelect(key)}
                  whileHover={disabled ? undefined : { x: 4 }}
                  whileTap={disabled ? undefined : { scale: 0.99 }}
                  className={[
                    "w-full text-left cursor-pointer group",
                    "rounded-[var(--radius-outer)] ring-1 transition-all duration-200",
                    !disabled
                      ? "ring-white/[0.08] hover:ring-accent/30 bg-surface-1 hover:bg-surface-2"
                      : "ring-white/[0.04] bg-surface-1/40 opacity-40 pointer-events-none",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Icon */}
                    <div className={[
                      "w-11 h-11 rounded-[var(--radius-button)] flex items-center justify-center shrink-0",
                      !disabled ? "bg-accent/10 text-accent" : "bg-surface-2 text-text-muted",
                    ].join(" ")}>
                      <PersonaIcon persona={key} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-text-primary block">
                        {config.label}
                      </span>
                      <span className="text-xs text-text-muted mt-0.5 block leading-relaxed">
                        {config.description}
                      </span>
                    </div>

                    {/* Arrow or "Soon" */}
                    {disabled ? (
                      <span className="text-[10px] font-medium text-text-ghost uppercase tracking-wider shrink-0">
                        Soon
                      </span>
                    ) : (
                      <svg className="w-4 h-4 text-text-muted/40 group-hover:text-accent/60 transition-colors shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
