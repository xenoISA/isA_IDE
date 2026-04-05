import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  MOCK_SCENARIOS,
  MOCK_EDGE_CASES,
  MOCK_RULE_RESULTS,
} from "./lib/mock-test-data";
import {
  MOCK_INFRA_REQUIREMENTS,
  MOCK_DEPLOY_CHECKLIST,
  MOCK_ENV_VARIABLES,
  MOCK_HEALTH_CHECKS,
  MOCK_HEALTH_RESPONSE,
} from "./lib/mock-ops-data";
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
// Test panels
import { TestCoveragePanel } from "./stages/test/TestCoveragePanel";
import { TestScenariosPanel } from "./stages/test/TestScenariosPanel";
import { TestResultsPanel } from "./stages/test/TestResultsPanel";
import { TestEdgeCasesPanel } from "./stages/test/TestEdgeCasesPanel";
// Ops panels
import { OpsInfraPanel } from "./stages/ops/OpsInfraPanel";
import { OpsDeployPanel } from "./stages/ops/OpsDeployPanel";
import { OpsHealthPanel } from "./stages/ops/OpsHealthPanel";
import { OpsConfigPanel } from "./stages/ops/OpsConfigPanel";

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

    // Test persona sections
    if (persona === "test") {
      switch (activeSection) {
        case "coverage":
          return (
            <TestCoveragePanel
              ruleResults={MOCK_RULE_RESULTS}
              mappings={MOCK_RULE_TEST_MAPPINGS}
            />
          );
        case "scenarios":
          return <TestScenariosPanel scenarios={MOCK_SCENARIOS} />;
        case "results":
          return <TestResultsPanel ruleResults={MOCK_RULE_RESULTS} />;
        case "edge-cases":
          return <TestEdgeCasesPanel edgeCases={MOCK_EDGE_CASES} />;
      }
    }

    // Ops persona sections
    if (persona === "ops") {
      switch (activeSection) {
        case "infrastructure":
          return <OpsInfraPanel requirements={MOCK_INFRA_REQUIREMENTS} />;
        case "deploy":
          return <OpsDeployPanel checklist={MOCK_DEPLOY_CHECKLIST} />;
        case "health":
          return (
            <OpsHealthPanel
              checks={MOCK_HEALTH_CHECKS}
              healthResponse={MOCK_HEALTH_RESPONSE}
            />
          );
        case "config":
          return <OpsConfigPanel variables={MOCK_ENV_VARIABLES} />;
      }
    }

    // Fallback
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Section not found
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
        <main className="flex-1 min-w-0 overflow-y-auto px-8 pt-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {persona ? (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderSection()}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
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
