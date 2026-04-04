import { useCallback, useRef, useState } from "react";
import { startOrchestration, streamOrchestration } from "@/lib/api";
import type { OrchestrationEvent } from "@/lib/types";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

interface UseOrchestrationOptions {
  onEvent: (event: OrchestrationEvent) => void;
  onConnectionChange: (status: ConnectionStatus) => void;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export function useOrchestration(options: UseOrchestrationOptions) {
  const { onEvent, onConnectionChange } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const closeRef = useRef<(() => void) | null>(null);
  const retriesRef = useRef(0);
  const projectIdRef = useRef<string | null>(null);
  const stoppedRef = useRef(false);

  const updateStatus = useCallback(
    (status: ConnectionStatus) => {
      setConnectionStatus(status);
      onConnectionChange(status);
    },
    [onConnectionChange],
  );

  const connectWs = useCallback(
    (projectId: string, sid: string) => {
      // Clean up previous connection
      closeRef.current?.();

      updateStatus("connecting");

      const cleanup = streamOrchestration(
        projectId,
        sid,
        (event) => {
          // First successful message means we're connected
          if (connectionStatus !== "connected") {
            updateStatus("connected");
            retriesRef.current = 0;
          }
          onEvent(event);
        },
        (_error) => {
          if (stoppedRef.current) return;

          if (retriesRef.current < MAX_RETRIES) {
            retriesRef.current += 1;
            const delay = BASE_DELAY_MS * Math.pow(2, retriesRef.current - 1);
            updateStatus("reconnecting");
            setTimeout(() => {
              if (!stoppedRef.current) {
                connectWs(projectId, sid);
              }
            }, delay);
          } else {
            updateStatus("disconnected");
            setIsRunning(false);
          }
        },
      );

      closeRef.current = cleanup;
    },
    [onEvent, updateStatus, connectionStatus],
  );

  const start = useCallback(
    async (projectId: string, prompt: string) => {
      stoppedRef.current = false;
      retriesRef.current = 0;
      projectIdRef.current = projectId;
      updateStatus("connecting");
      setIsRunning(true);

      const { session_id } = await startOrchestration({
        projectId,
        prompt,
      });

      setSessionId(session_id);
      connectWs(projectId, session_id);
    },
    [connectWs, updateStatus],
  );

  const stop = useCallback(() => {
    stoppedRef.current = true;
    closeRef.current?.();
    closeRef.current = null;
    setIsRunning(false);
    updateStatus("disconnected");
  }, [updateStatus]);

  const resume = useCallback(
    async (resumeSessionId: string) => {
      const projectId = projectIdRef.current;
      if (!projectId) {
        throw new Error("No project context — call start() first or set projectId");
      }

      stoppedRef.current = false;
      retriesRef.current = 0;
      updateStatus("connecting");
      setIsRunning(true);

      const { session_id } = await startOrchestration({
        projectId,
        prompt: "",
        resumeSessionId,
      });

      setSessionId(session_id);
      connectWs(projectId, session_id);
    },
    [connectWs, updateStatus],
  );

  return {
    start,
    stop,
    resume,
    isRunning,
    connectionStatus,
    sessionId,
  };
}
