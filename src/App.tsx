import { useState, useCallback } from "react";
import type { Stage, OrchestrationEvent } from "./lib/types";
import { emptySharedState } from "./lib/types";
import { applyEvent, eventToStage } from "./lib/events";
import { StageNav } from "./components/layout/StageNav";
import { Inspector } from "./components/layout/Inspector";
import { StatusBar } from "./components/layout/StatusBar";
import { IntentStage } from "./stages/IntentStage";
import { CDDStage } from "./stages/CDDStage";
import { TDDStage } from "./stages/TDDStage";

export default function App() {
  const [activeStage, setActiveStage] = useState<Stage>("intent");
  const [sharedState, setSharedState] = useState(emptySharedState);
  const [events, setEvents] = useState<OrchestrationEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleEvent = useCallback((event: OrchestrationEvent) => {
    setEvents((prev) => [...prev, event]);
    setSharedState((prev) => applyEvent(prev, event));

    // Auto-navigate to the relevant stage
    const stage = eventToStage(event);
    if (stage) setActiveStage(stage);

    // Detect completion
    if (event.type === "error") setIsRunning(false);
    if (
      event.type === "team_complete" &&
      event.gate === "deploy_success"
    ) {
      setIsRunning(false);
    }
  }, []);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setEvents([]);
    setSharedState(emptySharedState());
  }, []);

  const renderStage = () => {
    switch (activeStage) {
      case "intent":
        return (
          <IntentStage
            onStart={handleStart}
            onEvent={handleEvent}
            isRunning={isRunning}
          />
        );
      case "cdd":
        return (
          <CDDStage
            outputs={sharedState.cdd_outputs}
            gateComplete={sharedState.gates.cdd_complete}
          />
        );
      case "tdd":
        return (
          <TDDStage
            outputs={sharedState.tdd_outputs}
            gateComplete={sharedState.gates.tests_pass}
          />
        );
      case "code":
        return (
          <div className="flex items-center justify-center h-full text-text-muted">
            Code stage — Phase 2
          </div>
        );
      case "ship":
        return (
          <div className="flex items-center justify-center h-full text-text-muted">
            Ship stage — Phase 2
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      {/* Stage navigation */}
      <StageNav
        activeStage={activeStage}
        onStageChange={setActiveStage}
        gates={sharedState.gates}
        isRunning={isRunning}
      />

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Stage panel */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          {renderStage()}
        </main>

        {/* Inspector panel */}
        <Inspector
          events={events}
          sharedState={sharedState}
          isRunning={isRunning}
        />
      </div>

      {/* Status bar */}
      <StatusBar
        sessionId={sharedState.session_id}
        phase={sharedState.current_phase}
        gates={sharedState.gates}
      />
    </div>
  );
}
