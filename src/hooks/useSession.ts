import { useCallback, useSyncExternalStore } from "react";
import type { Gates, Phase, Session, SharedState } from "@/lib/types";

const STORAGE_KEY = "isa-ide-sessions";

// ─── External store for cross-component reactivity ──────────────

let listeners: Array<() => void> = [];
function emitChange() {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

// ─── Helpers ─────────────────────────────────────────────────────

function readSessions(): Session[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeSessions(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  emitChange();
}

// ─── Public interface ────────────────────────────────────────────

export interface SessionStore {
  sessions: Session[];
  saveSession: (state: SharedState, prompt: string, project: string) => void;
  deleteSession: (id: string) => void;
  getSession: (id: string) => Session | null;
}

export function useSessionStore(): SessionStore {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const sessions: Session[] = (() => {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  })();

  const saveSession = useCallback(
    (state: SharedState, prompt: string, project: string) => {
      const now = new Date().toISOString();
      const all = readSessions();
      const existing = all.findIndex((s) => s.id === state.session_id);

      const entry: Session = {
        id: state.session_id || crypto.randomUUID(),
        prompt,
        project,
        phase: state.current_phase as Phase,
        gates: { ...state.gates } as Gates,
        created_at: existing >= 0 ? all[existing].created_at : now,
        updated_at: now,
      };

      if (existing >= 0) {
        all[existing] = entry;
      } else {
        all.unshift(entry);
      }

      writeSessions(all);
    },
    [],
  );

  const deleteSession = useCallback((id: string) => {
    writeSessions(readSessions().filter((s) => s.id !== id));
  }, []);

  const getSession = useCallback(
    (id: string): Session | null => {
      return sessions.find((s) => s.id === id) ?? null;
    },
    [sessions],
  );

  return { sessions, saveSession, deleteSession, getSession };
}
