import { useCallback, useRef, useState } from "react";
import { MOCK_EVENTS } from "../lib/mock-data";
import type { OrchestrationEvent } from "../lib/types";

/**
 * Delay schedule per event index. Varies timing to feel organic.
 * Total: ~13 seconds for 11 events.
 */
const DELAY_SCHEDULE_MS: number[] = [
  500,   // orchestrator_init -> intent_classified
  800,   // intent_classified -> shared_state_init
  600,   // shared_state_init -> codebase_context
  1200,  // codebase_context -> team_delegated (product)
  1000,  // team_delegated -> phase_detected
  3000,  // phase_detected -> team_complete (CDD — the "big" step)
  1200,  // team_complete -> team_delegated (dev)
  800,   // team_delegated -> tdd_preflight
  1000,  // tdd_preflight -> phase_detected
  2500,  // phase_detected -> team_complete (TDD — another "big" step)
];

interface UseMockOrchestrationOptions {
  onEvent: (event: OrchestrationEvent) => void;
}

interface UseMockOrchestrationReturn {
  start: (prompt: string) => void;
  stop: () => void;
  isRunning: boolean;
}

export function useMockOrchestration(
  options: UseMockOrchestrationOptions
): UseMockOrchestrationReturn {
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const stoppedRef = useRef(false);

  const emitNext = useCallback(() => {
    if (stoppedRef.current) return;

    const idx = indexRef.current;
    if (idx >= MOCK_EVENTS.length) {
      setIsRunning(false);
      return;
    }

    // Emit the current event
    options.onEvent(MOCK_EVENTS[idx]);
    indexRef.current = idx + 1;

    // Schedule the next event if there are more
    if (idx + 1 < MOCK_EVENTS.length) {
      const delay = DELAY_SCHEDULE_MS[idx] ?? 1000;
      timerRef.current = setTimeout(emitNext, delay);
    } else {
      setIsRunning(false);
    }
  }, [options]);

  const start = useCallback(
    (_prompt: string) => {
      // Reset state
      stoppedRef.current = false;
      indexRef.current = 0;
      setIsRunning(true);

      // Emit the first event after a short initial delay
      timerRef.current = setTimeout(emitNext, 300);
    },
    [emitNext]
  );

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  return { start, stop, isRunning };
}
