import { CONFIG } from "./config";
import type { OrchestrationEvent, Project, Session, SharedState } from "./types";

// ─── Vibe API ────────────────────────────────────────────────────

export async function startOrchestration(params: {
  projectId: string;
  prompt: string;
  sessionId?: string;
  resumeSessionId?: string;
}): Promise<{ session_id: string; status: string }> {
  const res = await fetch(
    `${CONFIG.vibe.baseUrl}/api/v1/projects/${params.projectId}/run`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: params.prompt,
        session_id: params.sessionId,
        resume_session_id: params.resumeSessionId,
      }),
    }
  );
  if (!res.ok) throw new Error(`Vibe API error: ${res.status}`);
  return res.json();
}

export function streamOrchestration(
  projectId: string,
  sessionId: string,
  onEvent: (event: OrchestrationEvent) => void,
  onError: (error: Error) => void
): () => void {
  const url = `${CONFIG.vibe.wsUrl}/api/v1/projects/${projectId}/stream?session_id=${sessionId}`;
  const ws = new WebSocket(url);

  ws.onmessage = (e) => {
    try {
      const event: OrchestrationEvent = JSON.parse(e.data);
      onEvent(event);
    } catch {
      console.warn("Failed to parse orchestration event:", e.data);
    }
  };

  ws.onerror = () => onError(new Error("WebSocket connection failed"));
  ws.onclose = (e) => {
    if (!e.wasClean) onError(new Error(`WebSocket closed: ${e.code}`));
  };

  return () => ws.close();
}

export async function getSessionState(
  sessionId: string
): Promise<SharedState> {
  const res = await fetch(
    `${CONFIG.vibe.baseUrl}/api/v1/sessions/${sessionId}/state`
  );
  if (!res.ok) throw new Error(`Session state error: ${res.status}`);
  return res.json();
}

export async function listSessions(): Promise<Session[]> {
  const res = await fetch(`${CONFIG.vibe.baseUrl}/api/v1/sessions`);
  if (!res.ok) throw new Error(`Sessions list error: ${res.status}`);
  return res.json();
}

// ─── Orch API ────────────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(`${CONFIG.orch.baseUrl}/api/v1/projects`);
  if (!res.ok) throw new Error(`Orch projects error: ${res.status}`);
  return res.json();
}

// ─── File Content (via Tauri IPC or Vibe API) ────────────────────

export async function readFileContent(filePath: string): Promise<string> {
  const res = await fetch(
    `${CONFIG.vibe.baseUrl}/api/v1/files?path=${encodeURIComponent(filePath)}`
  );
  if (!res.ok) throw new Error(`File read error: ${res.status}`);
  return res.text();
}
