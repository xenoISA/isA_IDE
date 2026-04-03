import { useState, useCallback } from "react";
import type { OrchestrationEvent } from "@/lib/types";
import { startOrchestration, streamOrchestration } from "@/lib/api";

interface IntentStageProps {
  onStart: () => void;
  onEvent: (event: OrchestrationEvent) => void;
  isRunning: boolean;
}

const QUICK_ACTIONS = [
  { label: "New service", prompt: "Create a new microservice for " },
  { label: "Fix bug", prompt: "Fix bug #" },
  { label: "Add feature", prompt: "Add a feature to " },
  { label: "Generate CDD", prompt: "Generate all 6 CDD layers for " },
  { label: "Run TDD", prompt: "Run the full TDD pipeline for " },
];

export function IntentStage({ onStart, onEvent, isRunning }: IntentStageProps) {
  const [prompt, setPrompt] = useState("");
  const [project, setProject] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGo = useCallback(async () => {
    if (!prompt.trim()) return;
    setError(null);
    onStart();

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
      const msg = err instanceof Error ? err.message : "Failed to start orchestration";
      setError(msg);
      onEvent({ type: "error", error: msg });
    }
  }, [prompt, project, onStart, onEvent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleGo();
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-16">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-text-primary mb-1">
        What do you want to build?
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Describe your intent. The pipeline handles contracts, tests, code, and deployment.
      </p>

      {/* Prompt input */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Build a notification service that sends alerts via email and Slack when pipeline runs fail..."
          disabled={isRunning}
          rows={5}
          className="
            w-full p-4 rounded-lg
            bg-surface-2 border border-border
            text-text-primary text-sm
            placeholder:text-text-muted/50
            focus:outline-none focus:border-stage-intent focus:ring-1 focus:ring-stage-intent/30
            resize-none
            disabled:opacity-50
          "
        />
        <span className="absolute bottom-2 right-3 text-[10px] text-text-muted">
          {"\u2318"}+Enter to go
        </span>
      </div>

      {/* Project selector */}
      <div className="mt-3">
        <input
          type="text"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="Target project (e.g. isA_Agent_SDK)"
          disabled={isRunning}
          className="
            w-full px-4 py-2 rounded-md
            bg-surface-2 border border-border-subtle
            text-text-secondary text-xs
            placeholder:text-text-muted/40
            focus:outline-none focus:border-border
          "
        />
      </div>

      {/* Go button */}
      <button
        onClick={handleGo}
        disabled={isRunning || !prompt.trim()}
        className="
          mt-4 w-full py-2.5 rounded-lg
          bg-stage-intent text-white text-sm font-medium
          hover:brightness-110
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all cursor-pointer
        "
        style={{ boxShadow: "0 0 20px var(--color-stage-intent)30" }}
      >
        {isRunning ? "Running..." : "Go"}
      </button>

      {/* Error */}
      {error && (
        <p className="mt-3 text-xs text-fail">{error}</p>
      )}

      {/* Quick actions */}
      <div className="mt-8">
        <h3 className="text-xs font-medium text-text-muted mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => setPrompt(action.prompt)}
              disabled={isRunning}
              className="
                px-3 py-1.5 rounded-md
                bg-surface-2 border border-border-subtle
                text-xs text-text-secondary
                hover:bg-surface-3 hover:border-border
                disabled:opacity-40
                transition-colors cursor-pointer
              "
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
