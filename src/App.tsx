import { useState, useCallback, useRef } from "react";
import type { Stage, OrchestrationEvent } from "./lib/types";
import { emptySharedState } from "./lib/types";
import { applyEvent, eventToStage } from "./lib/events";
import { useMockOrchestration } from "./hooks/useMockOrchestration";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSessionStore } from "./hooks/useSession";
import { StageNav } from "./components/layout/StageNav";
import { Inspector } from "./components/layout/Inspector";
import { StatusBar } from "./components/layout/StatusBar";
import { GateApprovalDialog } from "./components/ui/GateApprovalDialog";
import { IntentStage } from "./stages/IntentStage";
import { CDDStage } from "./stages/CDDStage";
import { TDDStage } from "./stages/TDDStage";
import { CodeStage } from "./stages/CodeStage";

type Mode = "demo" | "live";
type PendingGate = "cdd_complete" | "tests_pass" | "deploy_success" | null;

export default function App() {
  const [activeStage, setActiveStage] = useState<Stage>("intent");
  const [sharedState, setSharedState] = useState(emptySharedState);
  const [events, setEvents] = useState<OrchestrationEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("demo");
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [pendingGate, setPendingGate] = useState<PendingGate>(null);

  const promptRef = useRef("");
  const projectRef = useRef("");
  const sessionStore = useSessionStore();

  // ─── Event handler ─────────────────────────────────────────────
  const handleEvent = useCallback((event: OrchestrationEvent) => {
    setEvents((prev) => [...prev, event]);
    setSharedState((prev) => {
      const next = applyEvent(prev, event);

      // Check for gate completion to trigger HIL dialog
      if (event.type === "team_complete") {
        if (event.gate === "cdd_complete" && !prev.gates.cdd_complete) {
          setPendingGate("cdd_complete");
        }
        if (event.gate === "tests_pass" && !prev.gates.tests_pass) {
          setPendingGate("tests_pass");
        }
      }

      return next;
    });

    // Auto-navigate to the relevant stage
    const stage = eventToStage(event);
    if (stage) setActiveStage(stage);

    // Detect completion
    if (event.type === "error") setIsRunning(false);
    if (event.type === "team_complete" && event.gate === "deploy_success") {
      setIsRunning(false);
    }
  }, []);

  // ─── Mock orchestration (demo mode) ────────────────────────────
  const mock = useMockOrchestration({ onEvent: handleEvent });

  // ─── Actions ───────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    setIsRunning(true);
    setEvents([]);
    setSharedState(emptySharedState());
    setPendingGate(null);
  }, []);

  const handleGo = useCallback(() => {
    if (!promptRef.current.trim() || isRunning) return;
    handleStart();
    if (mode === "demo") {
      mock.start(promptRef.current);
    }
    // Live mode: handled by IntentStage directly
  }, [mode, mock, handleStart, isRunning]);

  const handleStop = useCallback(() => {
    if (mode === "demo") {
      mock.stop();
    }
    setIsRunning(false);
  }, [mode, mock]);

  const handleToggleMode = useCallback(() => {
    setMode((m) => (m === "demo" ? "live" : "demo"));
  }, []);

  const handleToggleInspector = useCallback(() => {
    setInspectorCollapsed((c) => !c);
  }, []);

  // ─── Gate approval ─────────────────────────────────────────────
  const handleGateApprove = useCallback(() => {
    setPendingGate(null);
    // In live mode, would call approveGate API
  }, []);

  const handleGateReject = useCallback((_feedback: string) => {
    setPendingGate(null);
    // In live mode, would call rejectGate API with feedback
  }, []);

  // ─── Session resume ────────────────────────────────────────────
  const handleResume = useCallback((_sessionId: string) => {
    // For demo mode, just navigate to intent
    // Live mode would call useOrchestration.resume()
    setActiveStage("intent");
  }, []);

  // ─── Save session on state changes ─────────────────────────────
  const handleSaveSession = useCallback(() => {
    if (sharedState.session_id) {
      sessionStore.saveSession(sharedState, promptRef.current, projectRef.current);
    }
  }, [sharedState, sessionStore]);

  // Save when pipeline completes a gate
  const prevGatesRef = useRef(sharedState.gates);
  if (
    sharedState.session_id &&
    JSON.stringify(sharedState.gates) !== JSON.stringify(prevGatesRef.current)
  ) {
    prevGatesRef.current = sharedState.gates;
    handleSaveSession();
  }

  // ─── Keyboard shortcuts ────────────────────────────────────────
  useKeyboardShortcuts({
    onStageChange: setActiveStage,
    onGo: handleGo,
    onToggleInspector: handleToggleInspector,
    onStop: handleStop,
  });

  // ─── Stage rendering ──────────────────────────────────────────
  const effectiveRunning = mode === "demo" ? mock.isRunning : isRunning;

  const renderStage = () => {
    switch (activeStage) {
      case "intent":
        return (
          <IntentStage
            onStart={handleStart}
            onEvent={handleEvent}
            isRunning={effectiveRunning}
            mode={mode}
            mockStart={mock.start}
            promptRef={promptRef}
            projectRef={projectRef}
            sessions={sessionStore.sessions}
            onResume={handleResume}
            onDeleteSession={sessionStore.deleteSession}
          />
        );
      case "cdd":
        return (
          <CDDStage
            outputs={sharedState.cdd_outputs}
            gateComplete={sharedState.gates.cdd_complete}
            mode={mode}
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
        return <CodeStage codeChanges={sharedState.tdd_outputs.code_changes} />;
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
        isRunning={effectiveRunning}
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
          isRunning={effectiveRunning}
          collapsed={inspectorCollapsed}
          onToggle={handleToggleInspector}
        />
      </div>

      {/* Status bar */}
      <StatusBar
        sessionId={sharedState.session_id}
        phase={sharedState.current_phase}
        gates={sharedState.gates}
        mode={mode}
        onToggleMode={handleToggleMode}
      />

      {/* Gate approval dialog */}
      {pendingGate && (
        <GateApprovalDialog
          gate={pendingGate}
          onApprove={handleGateApprove}
          onReject={handleGateReject}
        />
      )}
    </div>
  );
}
