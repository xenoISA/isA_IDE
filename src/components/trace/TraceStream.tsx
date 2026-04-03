import { useRef, useEffect } from "react";
import type { OrchestrationEvent } from "@/lib/types";

interface TraceStreamProps {
  events: OrchestrationEvent[];
}

const EVENT_STYLES: Record<string, { dot: string; text: string }> = {
  orchestrator_init: { dot: "bg-stage-intent", text: "text-text-secondary" },
  intent_classified: { dot: "bg-stage-intent", text: "text-text-secondary" },
  team_delegated: { dot: "bg-running", text: "text-text-secondary" },
  team_complete: { dot: "bg-pass", text: "text-pass" },
  phase_detected: { dot: "bg-stage-cdd", text: "text-text-secondary" },
  error: { dot: "bg-fail", text: "text-fail" },
  warning: { dot: "bg-stage-tdd", text: "text-stage-tdd" },
};

const DEFAULT_STYLE = { dot: "bg-text-muted", text: "text-text-muted" };

export function TraceStream({ events }: TraceStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="p-3 text-xs text-text-muted">
        Waiting for orchestration events...
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {events.map((event, i) => {
        const style = EVENT_STYLES[event.type] ?? DEFAULT_STYLE;
        return (
          <div key={i} className="flex items-start gap-2 px-1 py-0.5">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-text-muted">
                {event.type}
              </span>
              {event.message && (
                <p className={`text-xs ${style.text} break-words`}>
                  {event.message}
                </p>
              )}
              {event.team && (
                <span className="text-[10px] text-text-muted">
                  [{event.team}]
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
