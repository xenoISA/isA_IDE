import type { Session, Phase } from "@/lib/types";

interface SessionCardProps {
  session: Session;
  onResume: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

const PHASE_COLORS: Record<Phase, string> = {
  planning: "bg-stage-intent/15 text-stage-intent",
  product: "bg-stage-cdd/15 text-stage-cdd",
  dev: "bg-stage-tdd/15 text-stage-tdd",
  ops: "bg-stage-ship/15 text-stage-ship",
};

const PHASE_LABELS: Record<Phase, string> = {
  planning: "Planning",
  product: "CDD",
  dev: "TDD",
  ops: "Deploy",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function SessionCard({ session, onResume, onDelete }: SessionCardProps) {
  const gateCount = [
    session.gates.cdd_complete,
    session.gates.tests_pass,
    session.gates.deploy_success,
  ].filter(Boolean).length;

  const truncatedPrompt =
    session.prompt.length > 60
      ? session.prompt.slice(0, 60) + "..."
      : session.prompt;

  const handleDelete = () => {
    if (window.confirm("Delete this session?")) {
      onDelete(session.id);
    }
  };

  return (
    <div
      className="
        p-3 rounded-lg border border-border bg-surface-1
        hover:border-border hover:bg-surface-2
        transition-colors cursor-pointer group
      "
      onClick={() => onResume(session.id)}
    >
      {/* Prompt line */}
      <p className="text-xs text-text-primary truncate">{truncatedPrompt}</p>

      {/* Metadata row */}
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[10px] font-mono text-text-muted">{session.project}</span>

        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PHASE_COLORS[session.phase]}`}>
          {PHASE_LABELS[session.phase]}
        </span>

        <span className="text-[10px] text-text-muted">{gateCount}/3</span>

        <span className="text-[10px] text-text-muted/60 ml-auto">
          {relativeTime(session.updated_at)}
        </span>

        {/* Delete button — visible on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="
            text-[10px] text-text-muted/40 hover:text-fail
            opacity-0 group-hover:opacity-100
            transition-opacity cursor-pointer
          "
          title="Delete session"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
