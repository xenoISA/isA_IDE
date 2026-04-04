import { useState, useCallback, useRef } from "react";
import type { OrchestrationEvent } from "./lib/types";
import { emptySharedState, PERSONA_CONFIG } from "./lib/types";
import { applyEvent, eventToSection } from "./lib/events";
import { useMockOrchestration } from "./hooks/useMockOrchestration";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSessionStore } from "./hooks/useSession";
import { usePersona } from "./hooks/usePersona";
import { MOCK_CDD_CONTENT } from "./lib/mock-data";
import {
  MOCK_USER_STORIES,
  MOCK_BUSINESS_RULES,
  MOCK_ARCH_DECISIONS,
  MOCK_DATA_MODELS,
  MOCK_RULE_TEST_MAPPINGS,
} from "./lib/mock-persona-data";
import { PersonaPicker } from "./components/persona/PersonaPicker";
import { PersonaNav } from "./components/persona/PersonaNav";
import { Inspector } from "./components/layout/Inspector";
import { StatusBar } from "./components/layout/StatusBar";
import { GateApprovalDialog } from "./components/ui/GateApprovalDialog";
import { IntentStage } from "./stages/IntentStage";
// PM panels
import { PMStoriesPanel } from "./stages/pm/PMStoriesPanel";
import { PMContractsPanel } from "./stages/pm/PMContractsPanel";
import { PMProgressPanel } from "./stages/pm/PMProgressPanel";
import { PMDecisionsPanel } from "./stages/pm/PMDecisionsPanel";
// Dev panels
import { DevArchitecturePanel } from "./stages/dev/DevArchitecturePanel";
import { DevModelsPanel } from "./stages/dev/DevModelsPanel";
import { DevCodePanel } from "./stages/dev/DevCodePanel";
import { DevLogicPanel } from "./stages/dev/DevLogicPanel";

type Mode = "demo" | "live";
type PendingGate = "cdd_complete" | "tests_pass" | "deploy_success" | null;

export default function App() {
  const { persona, setPersona: setPersonaRaw } = usePersona();
  const [activeSection, setActiveSection] = useState("intent");

  // Reset section to first persona section when persona changes
  const setPersona = useCallback(
    (p: Parameters<typeof setPersonaRaw>[0]) => {
      setPersonaRaw(p);
      setActiveSection(PERSONA_CONFIG[p].sections[0].key);
    },
    [setPersonaRaw]
  );
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
  const handleEvent = useCallback(
    (event: OrchestrationEvent) => {
      setEvents((prev) => [...prev, event]);
      setSharedState((prev) => {
        const next = applyEvent(prev, event);

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

      // Auto-navigate to persona-relevant section
      if (persona) {
        const section = eventToSection(event, persona);
        if (section) setActiveSection(section);
      }

      if (event.type === "error") setIsRunning(false);
      if (event.type === "team_complete" && event.gate === "deploy_success") {
        setIsRunning(false);
      }
    },
    [persona]
  );

  // ─── Mock orchestration ────────────────────────────────────────
  const mock = useMockOrchestration({ onEvent: handleEvent });

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setEvents([]);
    setSharedState(emptySharedState());
    setPendingGate(null);
  }, []);

  const handleGo = useCallback(() => {
    if (!promptRef.current.trim() || isRunning) return;
    handleStart();
    if (mode === "demo") mock.start(promptRef.current);
  }, [mode, mock, handleStart, isRunning]);

  const handleStop = useCallback(() => {
    if (mode === "demo") mock.stop();
    setIsRunning(false);
  }, [mode, mock]);

  const handleToggleMode = useCallback(() => {
    setMode((m) => (m === "demo" ? "live" : "demo"));
  }, []);

  const handleToggleInspector = useCallback(() => {
    setInspectorCollapsed((c) => !c);
  }, []);

  const handleGateApprove = useCallback(() => setPendingGate(null), []);
  const handleGateReject = useCallback((_feedback: string) => setPendingGate(null), []);

  const handleResume = useCallback((_sessionId: string) => {
    setActiveSection("intent");
  }, []);

  // ─── Save session on gate changes ─────────────────────────────
  const handleSaveSession = useCallback(() => {
    if (sharedState.session_id) {
      sessionStore.saveSession(sharedState, promptRef.current, projectRef.current);
    }
  }, [sharedState, sessionStore]);

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
    onStageChange: (stage) => {
      // Map Cmd+1-5 to persona sections
      if (!persona) return;
      const sections = [
        "intent",
        ...PERSONA_CONFIG[persona].sections.map((s) => s.key),
      ];
      const idx = ["intent", "cdd", "tdd", "code", "ship"].indexOf(stage);
      if (idx >= 0 && idx < sections.length) {
        setActiveSection(sections[idx]);
      }
    },
    onGo: handleGo,
    onToggleInspector: handleToggleInspector,
    onStop: handleStop,
  });

  const effectiveRunning = mode === "demo" ? mock.isRunning : isRunning;

  // ─── Section rendering (persona-aware) ─────────────────────────
  const renderSection = () => {
    if (activeSection === "intent") {
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
    }

    // PM persona sections
    if (persona === "pm") {
      switch (activeSection) {
        case "stories":
          return <PMStoriesPanel stories={MOCK_USER_STORIES} />;
        case "contracts":
          return <PMContractsPanel rules={MOCK_BUSINESS_RULES} />;
        case "progress":
          return (
            <PMProgressPanel
              stories={MOCK_USER_STORIES}
              rules={MOCK_BUSINESS_RULES}
              gates={sharedState.gates}
              handoffNotes={sharedState.handoff_notes}
            />
          );
        case "decisions":
          return <PMDecisionsPanel decisions={MOCK_ARCH_DECISIONS} />;
      }
    }

    // Dev persona sections
    if (persona === "dev") {
      switch (activeSection) {
        case "architecture":
          return (
            <DevArchitecturePanel
              designContent={MOCK_CDD_CONTENT.design}
              systemContent={MOCK_CDD_CONTENT.system_contract}
            />
          );
        case "models":
          return (
            <DevModelsPanel
              models={MOCK_DATA_MODELS}
              dataContractContent={MOCK_CDD_CONTENT.data_contract}
            />
          );
        case "code":
          return (
            <DevCodePanel
              codeChanges={sharedState.tdd_outputs.code_changes}
              coverage={sharedState.tdd_outputs.coverage}
              allPassing={sharedState.tdd_outputs.all_passing}
            />
          );
        case "logic":
          return (
            <DevLogicPanel
              logicContent={MOCK_CDD_CONTENT.logic_contract}
              rules={MOCK_BUSINESS_RULES}
              mappings={MOCK_RULE_TEST_MAPPINGS}
            />
          );
      }
    }

    // Fallback for Test/Ops (Phase 2)
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Coming soon
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      {/* Persona picker overlay */}
      {!persona && <PersonaPicker onSelect={setPersona} />}

      {/* Navigation */}
      {persona && (
        <PersonaNav
          persona={persona}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          gates={sharedState.gates}
          isRunning={effectiveRunning}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          {persona ? renderSection() : null}
        </main>

        {persona && (
          <Inspector
            events={events}
            sharedState={sharedState}
            isRunning={effectiveRunning}
            collapsed={inspectorCollapsed}
            onToggle={handleToggleInspector}
          />
        )}
      </div>

      {/* Status bar */}
      {persona && (
        <StatusBar
          sessionId={sharedState.session_id}
          phase={sharedState.current_phase}
          gates={sharedState.gates}
          mode={mode}
          onToggleMode={handleToggleMode}
          persona={persona}
          onPersonaChange={setPersona}
        />
      )}

      {/* Gate approval */}
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
