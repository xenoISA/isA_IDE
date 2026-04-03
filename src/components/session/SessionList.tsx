import type { Session } from "@/lib/types";
import { SessionCard } from "./SessionCard";

interface SessionListProps {
  sessions: Session[];
  onResume: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

export function SessionList({ sessions, onResume, onDelete }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-xs text-text-muted">No previous sessions</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onResume={onResume}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
