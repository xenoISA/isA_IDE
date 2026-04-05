import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Persona } from "@/lib/types";
import { PERSONA_CONFIG } from "@/lib/types";

interface PersonaSwitcherProps {
  persona: Persona;
  onChange: (p: Persona) => void;
}

const ALL_PERSONAS: { key: Persona; disabled: boolean }[] = [
  { key: "pm", disabled: false },
  { key: "dev", disabled: false },
  { key: "test", disabled: false },
  { key: "ops", disabled: false },
];

function PersonaIcon({ persona, size = 14 }: { persona: Persona; size?: number }) {
  switch (persona) {
    case "pm":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "dev":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="8 7 3 12 8 17" />
          <polyline points="16 7 21 12 16 17" />
        </svg>
      );
    case "test":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" />
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        </svg>
      );
    case "ops":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="4" rx="1" />
          <rect x="2" y="13" width="20" height="4" rx="1" />
          <circle cx="6" cy="9" r="0.5" fill="currentColor" />
          <circle cx="6" cy="15" r="0.5" fill="currentColor" />
        </svg>
      );
  }
}

export function PersonaSwitcher({ persona, onChange }: PersonaSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const config = PERSONA_CONFIG[persona];

  const handleSelect = useCallback(
    (key: Persona) => {
      onChange(key);
      setOpen(false);
    },
    [onChange],
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger pill */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.97 }}
        className={[
          "flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)]",
          "text-xs font-medium text-text-secondary",
          "bg-surface-2 border border-border hover:border-border-accent",
          "cursor-pointer transition-colors duration-150",
        ].join(" ")}
      >
        <PersonaIcon persona={persona} />
        <span>{config.label}</span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 w-44 bezel z-50"
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bezel-inner py-1">
              {ALL_PERSONAS.map(({ key, disabled }) => {
                const itemConfig = PERSONA_CONFIG[key];
                const isSelected = key === persona;

                return (
                  <motion.button
                    key={key}
                    onClick={() => !disabled && handleSelect(key)}
                    whileTap={disabled ? undefined : { scale: 0.98 }}
                    className={[
                      "w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left",
                      "transition-colors duration-100",
                      disabled
                        ? "opacity-40 pointer-events-none"
                        : "cursor-pointer hover:bg-white/[0.04]",
                      isSelected ? "text-accent" : "text-text-secondary",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <PersonaIcon persona={key} />
                    <span className="flex-1 font-medium">{itemConfig.label}</span>
                    {isSelected && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                    {disabled && (
                      <span className="text-[9px] text-text-ghost uppercase tracking-wider">
                        Soon
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
