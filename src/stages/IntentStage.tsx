import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrchestrationEvent, Session } from "@/lib/types";
import { startOrchestration, streamOrchestration } from "@/lib/api";

interface IntentStageProps {
  onStart: () => void;
  onEvent: (event: OrchestrationEvent) => void;
  isRunning: boolean;
  mode: "demo" | "live";
  mockStart: (prompt: string) => void;
  promptRef: React.MutableRefObject<string>;
  projectRef: React.MutableRefObject<string>;
  sessions: Session[];
  onResume: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

const QUICK_ACTIONS = [
  { label: "New service", prompt: "Create a new microservice for " },
  { label: "Fix bug", prompt: "Fix bug #" },
  { label: "Add feature", prompt: "Add a feature to " },
  { label: "Generate CDD", prompt: "Generate all 6 CDD layers for " },
  { label: "Run TDD", prompt: "Run the full TDD pipeline for " },
];

export function IntentStage({
  onStart,
  onEvent,
  isRunning,
  mode,
  mockStart,
  promptRef,
  projectRef,
  sessions,
  onResume,
  onDeleteSession,
}: IntentStageProps) {
  const [prompt, setPrompt] = useState("");
  const [project, setProject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAllSessions, setShowAllSessions] = useState(false);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    promptRef.current = value;
  };

  const handleProjectChange = (value: string) => {
    setProject(value);
    projectRef.current = value;
  };

  const handleGo = useCallback(async () => {
    if (!prompt.trim()) return;
    setError(null);
    promptRef.current = prompt;
    projectRef.current = project;
    onStart();

    if (mode === "demo") {
      mockStart(prompt.trim());
      return;
    }

    try {
      const { session_id } = await startOrchestration({
        projectId: project || "default",
        prompt: prompt.trim(),
      });

      streamOrchestration(
        project || "default",
        session_id,
        onEvent,
        (err) => {
          setError(err.message);
          onEvent({ type: "error", error: err.message });
        }
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to start orchestration";
      setError(msg);
      onEvent({ type: "error", error: msg });
    }
  }, [prompt, project, onStart, onEvent, mode, mockStart, promptRef, projectRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleGo();
    }
  };

  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, 3);

  return (
    <motion.div
      className={[
        "max-w-xl mx-auto",
        sessions.length === 0 ? "flex flex-col justify-center min-h-[70vh]" : "pt-8",
      ].join(" ")}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header -- left-aligned, editorial */}
      <h1 className="text-2xl tracking-tight font-medium text-text-primary mb-2">
        What do you want to build?
      </h1>
      <p className="text-sm text-text-secondary max-w-[50ch] mb-8">
        Describe your intent. Contracts, tests, and code follow.
      </p>

      {/* Double-bezel textarea */}
      <div className="bezel ring-1 ring-white/[0.06]">
        <div className="bezel-inner p-1">
          <textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Build a notification service that sends alerts via email and Slack when pipeline runs fail..."
            disabled={isRunning}
            rows={5}
            className="
              w-full px-3 py-4 rounded-[calc(var(--radius-inner)-0.25rem)]
              bg-surface-0 border-none
              text-text-primary text-sm leading-relaxed
              placeholder:text-text-muted/50
              focus:outline-none focus:ring-1 focus:ring-accent/40
              resize-none
              disabled:opacity-50
            "
          />
        </div>
      </div>

      {/* Project input -- subtle, same bezel style */}
      <div className="mt-3 bezel">
        <div className="bezel-inner">
          <input
            type="text"
            value={project}
            onChange={(e) => handleProjectChange(e.target.value)}
            placeholder="Target project (e.g. isA_Agent_SDK)"
            disabled={isRunning}
            className="
              w-full px-4 py-2.5 rounded-[calc(var(--radius-inner)-0.25rem)]
              bg-surface-0 border-none
              text-text-secondary text-xs
              placeholder:text-text-muted/40
              focus:outline-none focus:ring-1 focus:ring-accent/40
            "
          />
        </div>
      </div>

      {/* Go button */}
      <motion.button
        onClick={handleGo}
        disabled={isRunning || !prompt.trim()}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -1 }}
        className="
          mt-5 w-full py-3 rounded-[--radius-button]
          bg-accent text-bg text-sm font-semibold
          hover:brightness-110
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors cursor-pointer
          relative overflow-hidden
        "
      >
        {isRunning ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full border-2 border-bg border-t-transparent animate-spin" />
            Running
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Go
            <kbd className="text-[10px] font-mono bg-surface-2 rounded px-1.5 py-0.5 text-text-muted">
              Cmd+Enter
            </kbd>
          </span>
        )}
      </motion.button>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 text-xs text-fail"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Quick actions */}
      <div className="mt-10">
        <h3 className="text-xs font-medium text-text-muted border-b border-border pb-2 mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <motion.button
              key={action.label}
              onClick={() => handlePromptChange(action.prompt)}
              disabled={isRunning}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
              className="
                rounded-[--radius-button] px-4 py-2
                bg-surface-1 ring-1 ring-white/[0.08]
                text-xs text-text-secondary
                hover:bg-surface-2 hover:ring-white/[0.12]
                disabled:opacity-40
                transition-colors cursor-pointer
              "
            >
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sessions -- compact list, always visible if they exist */}
      {sessions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-medium text-text-muted border-b border-border pb-2 mb-3">
            Recent Sessions
          </h3>
          <div className="space-y-1">
            {visibleSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent/40 shrink-0" />
                <button
                  onClick={() => onResume(session.id)}
                  className="text-xs text-text-secondary hover:text-accent transition-colors cursor-pointer truncate flex-1 text-left"
                >
                  <span className="font-mono text-text-muted text-[11px]">
                    {session.project}
                  </span>
                  <span className="mx-1.5 text-text-muted/40">/</span>
                  <span className="truncate">{session.prompt}</span>
                </button>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="text-[10px] text-text-muted opacity-0 group-hover:opacity-100 hover:text-fail transition-all cursor-pointer"
                >
                  Remove
                </button>
              </motion.div>
            ))}
          </div>
          {sessions.length > 3 && !showAllSessions && (
            <button
              onClick={() => setShowAllSessions(true)}
              className="mt-2 text-[11px] text-accent hover:text-accent/80 transition-colors cursor-pointer"
            >
              Show all ({sessions.length})
            </button>
          )}
          {showAllSessions && sessions.length > 3 && (
            <button
              onClick={() => setShowAllSessions(false)}
              className="mt-2 text-[11px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
