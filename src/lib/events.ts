import type { OrchestrationEvent, Persona, SharedState, Stage } from "./types";

/**
 * Maps an orchestration event to the pipeline stage it corresponds to.
 */
export function eventToStage(event: OrchestrationEvent): Stage | null {
  switch (event.type) {
    case "orchestrator_init":
    case "intent_classified":
      return "intent";
    case "team_delegated":
    case "team_complete":
      if (event.team === "product_team") return "cdd";
      if (event.team === "dev_team") return "tdd";
      if (event.team === "ops_team") return "ship";
      return null;
    case "phase_detected":
      return null; // handled by gate updates
    default:
      return null;
  }
}

/**
 * Applies an orchestration event to the current shared state.
 * Returns a new state object (immutable update).
 */
export function applyEvent(
  state: SharedState,
  event: OrchestrationEvent
): SharedState {
  switch (event.type) {
    case "orchestrator_init":
      return {
        ...state,
        session_id: event.session_id ?? state.session_id,
      };

    case "intent_classified":
      return {
        ...state,
        current_phase: "product",
      };

    case "team_delegated":
      return {
        ...state,
        current_team: event.team ?? null,
        current_phase: teamToPhase(event.team),
      };

    case "team_complete": {
      const next = { ...state, current_team: null };

      if (event.team === "product_team" && event.outputs) {
        next.cdd_outputs = {
          ...state.cdd_outputs,
          ...(event.outputs as Partial<typeof state.cdd_outputs>),
        };
        if (event.gate === "cdd_complete") {
          next.gates = { ...state.gates, cdd_complete: true };
        }
      }

      if (event.team === "dev_team" && event.outputs) {
        next.tdd_outputs = {
          ...state.tdd_outputs,
          ...(event.outputs as Partial<typeof state.tdd_outputs>),
        };
        if (event.gate === "tests_pass") {
          next.gates = { ...state.gates, tests_pass: true };
        }
      }

      if (event.team === "ops_team" && event.outputs) {
        next.ops_outputs = {
          ...state.ops_outputs,
          ...(event.outputs as Partial<typeof state.ops_outputs>),
        };
        if (event.gate === "deploy_success") {
          next.gates = { ...state.gates, deploy_success: true };
        }
      }

      if (event.team) {
        next.handoff_notes = {
          ...state.handoff_notes,
          [event.team]: event.message ?? "",
        };
      }

      return next;
    }

    case "error":
      return {
        ...state,
        errors: [...state.errors, event.error ?? event.message ?? "Unknown error"],
      };

    default:
      return state;
  }
}

/**
 * Maps an orchestration event to a persona-specific section.
 */
export function eventToSection(
  event: OrchestrationEvent,
  persona: Persona
): string | null {
  if (event.type === "orchestrator_init" || event.type === "intent_classified") {
    return "intent";
  }

  if (event.type === "team_delegated" || event.type === "team_complete") {
    if (event.team === "product_team") {
      // CDD complete — navigate to the persona's relevant section
      return persona === "pm" ? "contracts"
        : persona === "dev" ? "architecture"
        : persona === "test" ? "scenarios"
        : "infrastructure";
    }
    if (event.team === "dev_team") {
      return persona === "pm" ? "progress"
        : persona === "dev" ? "code"
        : persona === "test" ? "results"
        : "deploy";
    }
    if (event.team === "ops_team") {
      return persona === "pm" ? "progress"
        : persona === "dev" ? "code"
        : persona === "test" ? "results"
        : "health";
    }
  }

  return null;
}

function teamToPhase(team?: string): SharedState["current_phase"] {
  if (team === "product_team") return "product";
  if (team === "dev_team") return "dev";
  if (team === "ops_team") return "ops";
  return "planning";
}
