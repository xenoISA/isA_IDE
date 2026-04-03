import { useState } from "react";
import type { OrchestrationEvent, SharedState } from "@/lib/types";
import { GateProgress } from "@/components/trace/GateProgress";
import { TraceStream } from "@/components/trace/TraceStream";
import { TeamBadge } from "@/components/trace/TeamBadge";

type Tab = "trace" | "gates";

interface InspectorProps {
  events: OrchestrationEvent[];
  sharedState: SharedState;
  isRunning: boolean;
}

export function Inspector({ events, sharedState, isRunning }: InspectorProps) {
  const [tab, setTab] = useState<Tab>("trace");

  return (
    <aside className="w-72 flex-shrink-0 border-l border-border bg-surface-1 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["trace", "gates"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`
              flex-1 px-3 py-2 text-xs font-medium capitalize cursor-pointer
              ${tab === t
                ? "text-text-primary border-b-2 border-stage-intent"
                : "text-text-muted hover:text-text-secondary"
              }
            `}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Current team */}
      {sharedState.current_team && (
        <div className="px-3 py-2 border-b border-border-subtle">
          <TeamBadge team={sharedState.current_team} isActive={isRunning} />
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "trace" && <TraceStream events={events} />}
        {tab === "gates" && (
          <div className="p-3">
            <GateProgress gates={sharedState.gates} />

            {/* Handoff notes */}
            {Object.entries(sharedState.handoff_notes).length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-text-secondary mb-2">
                  Handoff Notes
                </h4>
                {Object.entries(sharedState.handoff_notes).map(([team, note]) => (
                  <div key={team} className="mb-2">
                    <span className="text-xs text-text-muted">{team}:</span>
                    <p className="text-xs text-text-secondary mt-0.5">{note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Errors */}
            {sharedState.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-fail mb-2">Errors</h4>
                {sharedState.errors.map((err, i) => (
                  <p key={i} className="text-xs text-fail/80 mb-1">
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
