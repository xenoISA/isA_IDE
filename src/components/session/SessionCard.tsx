import { motion } from "framer-motion";
import type { Session, Phase } from "@/lib/types";

interface SessionCardProps {
  session: Session;
  onResume: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

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

function DeleteIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this session?")) {
      onDelete(session.id);
    }
  };

  return (
    <motion.div
      className="bezel cursor-pointer group transition-colors hover:bg-white/[0.03]"
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => onResume(session.id)}
    >
      <div className="bezel-inner px-4 py-3">
        {/* Prompt excerpt */}
        <p className="text-sm text-text-primary truncate">{truncatedPrompt}</p>

        {/* Metadata row */}
        <div className="flex items-center gap-2.5 mt-2">
          <span className="font-mono text-xs text-text-muted tabular-nums">
            {session.project}
          </span>

          <span className="text-xs text-text-muted">
            {PHASE_LABELS[session.phase]}
          </span>

          <span className="font-mono text-xs text-text-muted tabular-nums">
            {gateCount} of 3
          </span>

          <span className="text-xs text-text-ghost ml-auto">
            {relativeTime(session.updated_at)}
          </span>

          {/* Delete button */}
          <motion.button
            onClick={handleDelete}
            className="text-text-ghost hover:text-fail opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Delete session"
            whileTap={{ scale: 0.97 }}
          >
            <DeleteIcon />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
