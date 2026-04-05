import { CONFIG } from "./config";
import type { OrchestrationEvent, Project, Session, SharedState } from "./types";

// ─── Vibe API Types (matches real API schema) ────────────────────

export interface VibeProject {
  id: string;
  name: string;
  type: "microservice" | "data_product" | "react_app" | "library";
  description: string;
  target_path: string;
  status: {
    cdd_layers: Record<string, string>;
    tdd_layers: Record<string, string>;
    deployment_status: string;
    last_run_id: string | null;
    last_run_at: string | null;
  };
}

export interface VibeRun {
  id: string;
  project_id: string;
  mode: string;
  layers: string[];
  status: "pending" | "running" | "completed" | "failed";
  result: Record<string, unknown> | null;
  started_at: string;
  completed_at: string | null;
}

// ─── Vibe API: Projects ──────────────────────────────────────────

export async function listVibeProjects(): Promise<VibeProject[]> {
  const res = await fetch(`${CONFIG.vibe.baseUrl}/api/v1/projects`);
  if (!res.ok) throw new Error(`Vibe projects error: ${res.status}`);
  return res.json();
}

export async function createVibeProject(params: {
  name: string;
  targetPath: string;
  type?: string;
}): Promise<VibeProject> {
  const res = await fetch(`${CONFIG.vibe.baseUrl}/api/v1/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: params.name,
      target_path: params.targetPath,
      type: params.type ?? "microservice",
    }),
  });
  if (!res.ok) throw new Error(`Create project error: ${res.status}`);
  return res.json();
}

export async function getVibeProjectStatus(projectId: string): Promise<VibeProject> {
  const res = await fetch(`${CONFIG.vibe.baseUrl}/api/v1/projects/${projectId}`);
  if (!res.ok) throw new Error(`Project status error: ${res.status}`);
  return res.json();
}

// ─── Vibe API: Runs ──────────────────────────────────────────────

export async function startRun(
  projectId: string,
  prompt: string,
  mode: string = "full"
): Promise<VibeRun> {
  const res = await fetch(
    `${CONFIG.vibe.baseUrl}/api/v1/projects/${projectId}/run`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, mode }),
    }
  );
  if (!res.ok) throw new Error(`Start run error: ${res.status}`);
  return res.json();
}

export async function getRunStatus(
  projectId: string,
  runId: string
): Promise<VibeRun> {
  const res = await fetch(
    `${CONFIG.vibe.baseUrl}/api/v1/projects/${projectId}/runs/${runId}`
  );
  if (!res.ok) throw new Error(`Run status error: ${res.status}`);
  return res.json();
}

// ─── Vibe API: CDD/TDD specific ─────────────────────────────────

export async function runCDD(
  projectId: string,
  prompt: string,
  layer?: string
): Promise<VibeRun> {
  const url = layer
    ? `${CONFIG.vibe.baseUrl}/api/v1/projects/${projectId}/cdd/${layer}`
    : `${CONFIG.vibe.baseUrl}/api/v1/projects/${projectId}/cdd`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`CDD run error: ${res.status}`);
  return res.json();
}

export async function runTDD(
  projectId: string,
  prompt: string
): Promise<VibeRun> {
  const res = await fetch(
    `${CONFIG.vibe.baseUrl}/api/v1/projects/${projectId}/tdd`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    }
  );
  if (!res.ok) throw new Error(`TDD run error: ${res.status}`);
  return res.json();
}

// ─── Vibe API: Health ────────────────────────────────────────────

export async function checkVibeHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${CONFIG.vibe.baseUrl}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Polling helper ──────────────────────────────────────────────

export function pollRunStatus(
  projectId: string,
  runId: string,
  onUpdate: (run: VibeRun) => void,
  onError: (error: Error) => void,
  intervalMs: number = 2000
): () => void {
  let stopped = false;

  async function poll() {
    if (stopped) return;
    try {
      const run = await getRunStatus(projectId, runId);
      onUpdate(run);
      if (run.status === "completed" || run.status === "failed") {
        return; // stop polling
      }
      setTimeout(poll, intervalMs);
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  poll();
  return () => { stopped = true; };
}

// ─── Legacy compatibility (used by demo mode) ────────────────────

export async function startOrchestration(params: {
  projectId: string;
  prompt: string;
  sessionId?: string;
  resumeSessionId?: string;
}): Promise<{ session_id: string; status: string }> {
  const run = await startRun(params.projectId, params.prompt);
  return { session_id: run.id, status: run.status };
}

export function streamOrchestration(
  projectId: string,
  sessionId: string,
  onEvent: (event: OrchestrationEvent) => void,
  onError: (error: Error) => void
): () => void {
  // Use polling since the real API doesn't have WebSocket streaming
  return pollRunStatus(
    projectId,
    sessionId,
    (run) => {
      onEvent({
        type: run.status === "completed" ? "team_complete" :
              run.status === "failed" ? "error" : "team_delegated",
        message: `Run ${run.id}: ${run.status}`,
        session_id: run.id,
      });
    },
    onError
  );
}

// ─── Orch API ────────────────────────────────────────────────────

export async function listProjects(): Promise<Project[]> {
  try {
    const vibeProjects = await listVibeProjects();
    return vibeProjects.map((p) => ({
      name: p.name,
      language: p.type === "react_app" ? "typescript" : "python",
      path: p.target_path,
      github: "",
      description: p.description,
    }));
  } catch {
    return [];
  }
}

// ─── Gate Approval (HIL) ─────────────────────────────────────────

export async function approveGate(
  sessionId: string,
  gate: string
): Promise<void> {
  const res = await fetch(
    `${CONFIG.vibe.baseUrl}/api/v1/sessions/${sessionId}/gates/${gate}/approve`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`Gate approve error: ${res.status}`);
}

export async function rejectGate(
  sessionId: string,
  gate: string,
  feedback: string
): Promise<void> {
  const res = await fetch(
    `${CONFIG.vibe.baseUrl}/api/v1/sessions/${sessionId}/gates/${gate}/reject`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback }),
    }
  );
  if (!res.ok) throw new Error(`Gate reject error: ${res.status}`);
}

// ─── File Content ────────────────────────────────────────────────

export async function readFileContent(filePath: string): Promise<string> {
  // Try Tauri IPC first for local files, fall back to Vibe API
  try {
    const res = await fetch(
      `${CONFIG.vibe.baseUrl}/api/v1/files?path=${encodeURIComponent(filePath)}`
    );
    if (res.ok) return res.text();
  } catch { /* fall through */ }

  return `// File content not available: ${filePath}`;
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
