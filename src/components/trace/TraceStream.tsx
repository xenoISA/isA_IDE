import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrchestrationEvent } from "@/lib/types";

interface TraceStreamProps {
  events: OrchestrationEvent[];
}

const DOT_COLOR: Record<string, string> = {
  error: "bg-fail",
  warning: "bg-warn",
  team_complete: "bg-accent",
  orchestrator_init: "bg-accent",
  intent_classified: "bg-accent",
  team_delegated: "bg-accent",
  phase_detected: "bg-accent",
  session_resumed: "bg-accent",
  shared_state_init: "bg-accent",
  codebase_context: "bg-accent",
  tdd_preflight: "bg-accent",
};

const DEFAULT_DOT = "bg-text-muted";

export function TraceStream({ events }: TraceStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    bottomRef.current?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-4">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-accent"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="text-xs text-text-muted">Waiting for events...</span>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="p-2 space-y-0.5 overflow-y-auto">
      <AnimatePresence initial={false}>
        {events.map((event, i) => {
          const dotClass = DOT_COLOR[event.type] ?? DEFAULT_DOT;

          return (
            <motion.div
              key={i}
              className="flex items-start gap-2 px-1.5 py-1 rounded-lg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotClass}`}
              />
              <div className="min-w-0 flex-1">
                <span className="font-mono text-xs text-text-muted">
                  {event.type}
                </span>
                {event.message && (
                  <p className="text-xs text-text-secondary break-words leading-relaxed">
                    {event.message}
                  </p>
                )}
                {event.team && (
                  <span className="font-mono text-xs text-text-ghost">
                    [{event.team}]
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
