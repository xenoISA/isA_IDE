"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrchestrationEvent, SharedState } from "@/lib/types";
import { GateProgress } from "@/components/trace/GateProgress";
import { TraceStream } from "@/components/trace/TraceStream";
import { TeamBadge } from "@/components/trace/TeamBadge";

type Tab = "trace" | "gates";

const TABS: Tab[] = ["trace", "gates"];

interface InspectorProps {
  events: OrchestrationEvent[];
  sharedState: SharedState;
  isRunning: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={direction === "right" ? "rotate-180" : ""}
      aria-hidden="true"
    >
      <path
        d="M8.75 3.5L5.25 7L8.75 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Inspector({
  events,
  sharedState,
  isRunning,
  collapsed = false,
  onToggle,
}: InspectorProps) {
  const [tab, setTab] = useState<Tab>("trace");

  return (
    <motion.aside
      className="flex-shrink-0 inspector-panel"
      animate={{ width: collapsed ? 32 : 240 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
    >
      {collapsed ? (
        /* ─── Collapsed strip ─────────────────────────────────── */
        <div className="h-full bezel flex items-start justify-center">
          <div className="h-full bezel-inner flex items-start justify-center">
            <button
              onClick={onToggle}
              className="mt-3 text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
              aria-label="Toggle inspector"
            >
              <div className="rotate-90">
                <ChevronIcon direction="right" />
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* ─── Expanded panel ──────────────────────────────────── */
        <div className="h-full bezel flex flex-col">
          <div className="h-full bezel-inner flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "relative flex-1 px-3 py-2.5 text-xs font-medium capitalize cursor-pointer",
                    "transition-colors duration-150",
                    tab === t
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-secondary",
                  ].join(" ")}
                >
                  {t}
                  {/* Underline indicator */}
                  {tab === t && (
                    <motion.div
                      layoutId="inspector-tab-indicator"
                      className="absolute bottom-0 left-3 right-3 h-px bg-accent"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Current team */}
            <AnimatePresence mode="wait">
              {sharedState.current_team && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 py-2 border-b border-border-subtle"
                >
                  <TeamBadge team={sharedState.current_team} isActive={isRunning} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {tab === "trace" && <TraceStream events={events} />}
              {tab === "gates" && (
                <div className="p-3">
                  <GateProgress gates={sharedState.gates} />

                  {/* Handoff notes */}
                  {Object.entries(sharedState.handoff_notes).length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-xs font-medium text-text-secondary mb-2 tracking-wide">
                        Handoff Notes
                      </h4>
                      {Object.entries(sharedState.handoff_notes).map(
                        ([team, note]) => (
                          <div key={team} className="mb-3">
                            <span className="text-[0.6875rem] font-medium text-text-muted uppercase tracking-wider">
                              {team}
                            </span>
                            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                              {note}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Errors */}
                  {sharedState.errors.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-xs font-medium text-fail mb-2">
                        Errors
                      </h4>
                      {sharedState.errors.map((err, i) => (
                        <div
                          key={i}
                          className="mb-2 pl-3 border-l-2 border-fail/40"
                        >
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {err}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Collapse button */}
            {onToggle && (
              <button
                onClick={onToggle}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border-t border-border text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
                aria-label="Toggle inspector"
              >
                <span className="text-[0.6875rem]">Collapse</span>
                <ChevronIcon direction="left" />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
}
