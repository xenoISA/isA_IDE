// ─── Pipeline Stages ─────────────────────────────────────────────
export type Stage = "intent" | "cdd" | "tdd" | "code" | "ship";

// ─── Orchestration Events (from isA_Vibe SSE/WS) ────────────────
export type EventType =
  | "orchestrator_init"
  | "intent_classified"
  | "session_resumed"
  | "shared_state_init"
  | "codebase_context"
  | "tdd_preflight"
  | "team_delegated"
  | "team_complete"
  | "phase_detected"
  | "error"
  | "warning";

export interface OrchestrationEvent {
  type: EventType;
  message?: string;
  session_id?: string;
  workflow?: string;
  team?: string;
  shared_state?: SharedState;
  outputs?: CDDOutputs | TDDOutputs | OpsOutputs;
  gate?: string;
  error?: string;
}

// ─── Shared State (mirrors isA_Vibe SharedState) ─────────────────
export interface SharedState {
  session_id: string;
  service_name: string;
  current_phase: Phase;
  current_team: string | null;
  cdd_outputs: CDDOutputs;
  tdd_outputs: TDDOutputs;
  ops_outputs: OpsOutputs;
  gates: Gates;
  handoff_notes: Record<string, string>;
  errors: string[];
  history: HistoryEntry[];
}

export type Phase = "planning" | "product" | "dev" | "ops";

export interface Gates {
  cdd_complete: boolean;
  tests_pass: boolean;
  deploy_success: boolean;
}

// ─── CDD Outputs (6 layers) ─────────────────────────────────────
export interface CDDOutputs {
  research: string | null;
  domain: string | null;       // L1: docs/domain/*.md
  prd: string | null;          // L2: docs/prd/*.md
  design: string | null;       // L3: docs/design/*.md
  data_contract: string | null; // L4: tests/contracts/*/data_contract.py
  logic_contract: string | null; // L5: tests/contracts/*/logic_contract.md
  system_contract: string | null; // L6: tests/contracts/*/system_contract.md
}

export type CDDLayer = keyof Omit<CDDOutputs, "research">;

export const CDD_LAYERS: { key: CDDLayer; label: string; level: string }[] = [
  { key: "domain", label: "Domain", level: "L1" },
  { key: "prd", label: "PRD", level: "L2" },
  { key: "design", label: "Design", level: "L3" },
  { key: "data_contract", label: "Data Contract", level: "L4" },
  { key: "logic_contract", label: "Logic Contract", level: "L5" },
  { key: "system_contract", label: "System Contract", level: "L6" },
];

// ─── TDD Outputs (5 layers) ─────────────────────────────────────
export interface TDDOutputs {
  test_results: TestResults;
  code_changes: string[];
  coverage: number;
  all_passing: boolean;
}

export interface TestResults {
  unit: LayerResult;
  component: LayerResult;
  integration: LayerResult;
  api: LayerResult;
  smoke: LayerResult;
}

export type TestLayer = keyof TestResults;

export const TEST_LAYERS: { key: TestLayer; label: string; level: string }[] = [
  { key: "unit", label: "Unit", level: "L1" },
  { key: "component", label: "Component", level: "L2" },
  { key: "integration", label: "Integration", level: "L3" },
  { key: "api", label: "API", level: "L4" },
  { key: "smoke", label: "Smoke / E2E", level: "L5" },
];

export interface LayerResult {
  passed: number;
  failed: number;
  skipped: number;
}

// ─── Ops Outputs ─────────────────────────────────────────────────
export interface OpsOutputs {
  local_dev_ready: boolean;
  docker_image: string | null;
  k8s_deployed: boolean;
  health_status: string | null;
  pr_url: string | null;
  ci_status: string | null;
}

// ─── Session ─────────────────────────────────────────────────────
export interface Session {
  id: string;
  prompt: string;
  project: string;
  phase: Phase;
  gates: Gates;
  created_at: string;
  updated_at: string;
}

// ─── Project (from isA_Orch registry) ────────────────────────────
export interface Project {
  name: string;
  language: string;
  path: string;
  github: string;
  description?: string;
}

// ─── History ─────────────────────────────────────────────────────
export interface HistoryEntry {
  timestamp: string;
  team: string;
  action: string;
  details?: string;
}

// ─── Persona System ─────────────────────────────────────────────
export type Persona = "pm" | "dev" | "test" | "ops";

export interface PersonaSection {
  key: string;
  label: string;
}

export const PERSONA_CONFIG: Record<Persona, { label: string; description: string; sections: PersonaSection[] }> = {
  pm: {
    label: "Product",
    description: "User stories, business rules, acceptance criteria",
    sections: [
      { key: "stories", label: "Stories" },
      { key: "contracts", label: "Contracts" },
      { key: "progress", label: "Progress" },
      { key: "decisions", label: "Decisions" },
    ],
  },
  dev: {
    label: "Developer",
    description: "Architecture, data models, code, logic correctness",
    sections: [
      { key: "architecture", label: "Architecture" },
      { key: "models", label: "Models" },
      { key: "code", label: "Code" },
      { key: "logic", label: "Logic" },
    ],
  },
  test: {
    label: "Test",
    description: "Coverage, scenarios, edge cases, results",
    sections: [
      { key: "coverage", label: "Coverage" },
      { key: "scenarios", label: "Scenarios" },
      { key: "results", label: "Results" },
      { key: "edge-cases", label: "Edge Cases" },
    ],
  },
  ops: {
    label: "Operations",
    description: "Infrastructure, deployment, health, configuration",
    sections: [
      { key: "infrastructure", label: "Infrastructure" },
      { key: "deploy", label: "Deploy" },
      { key: "health", label: "Health" },
      { key: "config", label: "Config" },
    ],
  },
};

// ─── Parsed Data (persona-specific views of CDD/TDD) ────────────
export interface BusinessRule {
  id: string;
  title: string;
  description: string;
  status: "verified" | "pending" | "failed";
}

export interface UserStory {
  id: string;
  as: string;
  want: string;
  soThat: string;
  criteria: AcceptanceCriterion[];
}

export interface AcceptanceCriterion {
  text: string;
  status: "pass" | "fail" | "pending";
}

export interface DataModel {
  name: string;
  fields: { name: string; type: string; description: string }[];
}

export interface DomainEvent {
  name: string;
  description: string;
}

export interface ArchDecision {
  title: string;
  description: string;
  rationale: string;
}

export interface RuleTestMapping {
  ruleId: string;
  ruleName: string;
  tests: { name: string; layer: TestLayer; status: "pass" | "fail" | "skip" }[];
}

// ─── Helpers ─────────────────────────────────────────────────────
export function emptySharedState(): SharedState {
  return {
    session_id: "",
    service_name: "",
    current_phase: "planning",
    current_team: null,
    cdd_outputs: {
      research: null,
      domain: null,
      prd: null,
      design: null,
      data_contract: null,
      logic_contract: null,
      system_contract: null,
    },
    tdd_outputs: {
      test_results: {
        unit: { passed: 0, failed: 0, skipped: 0 },
        component: { passed: 0, failed: 0, skipped: 0 },
        integration: { passed: 0, failed: 0, skipped: 0 },
        api: { passed: 0, failed: 0, skipped: 0 },
        smoke: { passed: 0, failed: 0, skipped: 0 },
      },
      code_changes: [],
      coverage: 0,
      all_passing: false,
    },
    ops_outputs: {
      local_dev_ready: false,
      docker_image: null,
      k8s_deployed: false,
      health_status: null,
      pr_url: null,
      ci_status: null,
    },
    gates: {
      cdd_complete: false,
      tests_pass: false,
      deploy_success: false,
    },
    handoff_notes: {},
    errors: [],
    history: [],
  };
}
