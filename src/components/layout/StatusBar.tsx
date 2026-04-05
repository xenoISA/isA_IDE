"use client";

import { motion } from "framer-motion";
import type { Gates, Persona, Phase } from "@/lib/types";
import { PersonaSwitcher } from "@/components/persona/PersonaSwitcher";

type Mode = "demo" | "live";

interface StatusBarProps {
  sessionId: string;
  phase: Phase;
  gates: Gates;
  mode?: Mode;
  onToggleMode?: () => void;
  persona?: Persona;
  onPersonaChange?: (p: Persona) => void;
  vibeConnected?: boolean;
}

const PHASE_LABELS: Record<Phase, string> = {
  planning: "Planning",
  product: "CDD (Product Team)",
  dev: "TDD (Dev Team)",
  ops: "Deploy (Ops Team)",
};

export function StatusBar({
  sessionId,
  phase,
  gates,
  mode = "demo",
  onToggleMode,
  persona,
  onPersonaChange,
  vibeConnected = false,
}: StatusBarProps) {
  const gateCount = [
    gates.cdd_complete,
    gates.tests_pass,
    gates.deploy_success,
  ].filter(Boolean).length;

  return (
    <footer className="mx-4 mb-3 mt-1">
      <div className="glass rounded-[var(--radius-outer)] ring-1 ring-white/[0.06] px-5 py-2.5 flex items-center text-xs gap-4">
        {/* Vibe connection indicator */}
        <div className="flex items-center gap-1.5" title={vibeConnected ? "Vibe API connected" : "Vibe API disconnected"}>
          <span className={`w-1.5 h-1.5 rounded-full ${vibeConnected ? "bg-accent" : "bg-fail/60"}`} />
          <span className="text-[0.625rem] text-text-ghost font-mono">
            {vibeConnected ? "API" : "offline"}
          </span>
        </div>

        <span className="w-px h-3 bg-border" />

        {/* Mode toggle pill */}
        <motion.button
          onClick={onToggleMode}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] bg-surface-2/60 border border-border cursor-pointer transition-colors hover:bg-surface-2"
        >
          <span
            className={[
              "w-1.5 h-1.5 rounded-full",
              mode === "live" ? "bg-accent" : "bg-warn",
            ].join(" ")}
          />
          <span className="text-[0.6875rem] font-medium text-text-secondary">
            {mode === "demo" ? "Demo" : "Live"}
          </span>
        </motion.button>

        {/* Persona switcher */}
        {persona && onPersonaChange && (
          <>
            <PersonaSwitcher persona={persona} onChange={onPersonaChange} />
            <span className="w-px h-3 bg-border" />
          </>
        )}

        {sessionId ? (
          <>
            {/* Session ID */}
            <span className="text-text-muted">
              Session{" "}
              <span className="font-mono text-text-secondary">
                {sessionId.slice(0, 12)}
              </span>
            </span>

            <span className="w-px h-3 bg-border" />

            {/* Phase */}
            <span className="text-text-muted">
              {PHASE_LABELS[phase]}
            </span>

            <span className="w-px h-3 bg-border" />

            {/* Gate count */}
            <span className="text-text-muted">
              Gates{" "}
              <span className="font-mono text-text-secondary">
                {gateCount} of 3
              </span>
            </span>
          </>
        ) : (
          <span className="text-text-muted">No active session</span>
        )}

        {/* Version */}
        <span className="ml-auto text-text-ghost text-[0.6875rem]">
          v0.1.0
        </span>
      </div>
    </footer>
  );
}
