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
  const cls = "w-10 h-10";

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

export function PersonaPicker({ onSelect }: PersonaPickerProps) {
  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 w-full max-w-lg mx-4"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
              How do you work?
            </h1>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed mb-10">
              Choose your perspective. The same data, rendered in your language.
            </p>
          </div>

          {/* Radial gradient backdrop — visible warm emerald glow */}
          <div className="relative">
            <div className="absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.10)_0%,rgba(52,211,153,0.03)_40%,transparent_70%)] pointer-events-none blur-2xl" />

          {/* 2x2 Grid */}
          <div className="relative grid grid-cols-2 gap-3">
            {PERSONAS.map(({ key, disabled }) => {
              const config = PERSONA_CONFIG[key];

              return (
                <motion.button
                  key={key}
                  onClick={() => !disabled && onSelect(key)}
                  whileHover={disabled ? undefined : { y: -2 }}
                  whileTap={disabled ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className={[
                    "bezel text-left cursor-pointer group",
                    !disabled && "hover:ring-1 hover:ring-white/[0.08] hover:shadow-[0_8px_32px_-8px_rgba(52,211,153,0.12)]",
                    disabled && "opacity-40 pointer-events-none",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={[
                    "bezel-inner p-5 flex flex-col gap-3",
                    !disabled ? "bg-zinc-800/80" : "bg-zinc-900/60",
                  ].filter(Boolean).join(" ")}>
                    <div className="w-12 h-12 flex items-center justify-center text-text-secondary">
                      <PersonaIcon persona={key} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-text-primary block">
                        {config.label}
                      </span>
                      <span className="text-xs text-text-muted mt-0.5 block leading-relaxed">
                        {config.description}
                      </span>
                    </div>
                    {disabled && (
                      <span className="text-[10px] font-medium text-text-ghost uppercase tracking-wider">
                        Coming soon
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
