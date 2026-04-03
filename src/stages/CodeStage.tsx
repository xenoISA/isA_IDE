interface CodeStageProps {
  codeChanges: string[];
}

function getFileIcon(filePath: string): { icon: string; color: string } {
  const name = filePath.toLowerCase();
  if (name.includes("test")) return { icon: "T", color: "text-stage-tdd" };
  if (name.includes("__init__")) return { icon: "P", color: "text-stage-cdd" };
  return { icon: "C", color: "text-stage-code" };
}

export function CodeStage({ codeChanges }: CodeStageProps) {
  if (codeChanges.length === 0) {
    return (
      <div className="max-w-3xl mx-auto pt-16 text-center">
        <div className="text-text-muted mb-2">
          <svg className="w-10 h-10 mx-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <p className="text-sm text-text-muted">No code changes yet.</p>
        <p className="text-xs text-text-muted/60 mt-1">Run the TDD pipeline to generate code.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Code</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {codeChanges.length} file{codeChanges.length !== 1 ? "s" : ""} changed
          </p>
        </div>
      </div>

      {/* File list */}
      <div className="space-y-1.5">
        {codeChanges.map((file) => {
          const { icon, color } = getFileIcon(file);
          return (
            <div
              key={file}
              className="flex items-center gap-3 px-4 py-2.5 bg-surface-1 border border-border rounded-lg"
            >
              {/* File type icon */}
              <span
                className={`
                  w-6 h-6 rounded flex items-center justify-center
                  text-[10px] font-bold bg-surface-2 ${color}
                `}
              >
                {icon}
              </span>

              {/* File path */}
              <span className="text-xs font-mono text-text-secondary flex-1 min-w-0 truncate">
                {file}
              </span>

              {/* View button (disabled — Phase 2) */}
              <button
                disabled
                className="
                  text-[10px] px-2 py-0.5 rounded
                  bg-surface-2 text-text-muted
                  cursor-not-allowed opacity-40
                "
              >
                View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
