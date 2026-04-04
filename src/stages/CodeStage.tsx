import { motion } from "framer-motion";

interface CodeStageProps {
  codeChanges: string[];
}

function getFileType(filePath: string): "test" | "init" | "code" {
  const name = filePath.toLowerCase();
  if (name.includes("test")) return "test";
  if (name.includes("__init__")) return "init";
  return "code";
}

/** SVG icons per file type */
function FileIcon({ type }: { type: "test" | "init" | "code" }) {
  if (type === "test") {
    return (
      <svg
        className="w-3.5 h-3.5 text-accent"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 8l3 3 5-6"
        />
      </svg>
    );
  }
  if (type === "init") {
    return (
      <svg
        className="w-3.5 h-3.5 text-text-muted"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="3" width="10" height="10" rx="2" />
        <path strokeLinecap="round" d="M6 8h4" />
      </svg>
    );
  }
  // code
  return (
    <svg
      className="w-3.5 h-3.5 text-info"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5"
      />
    </svg>
  );
}

export function CodeStage({ codeChanges }: CodeStageProps) {
  if (codeChanges.length === 0) {
    return (
      <motion.div
        className="max-w-3xl pt-20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col items-start gap-4">
          {/* Large muted code icon */}
          <svg
            className="w-12 h-12 text-text-muted/20"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 12L4 24l12 12M32 12l12 12-12 12M28 8L20 40"
            />
          </svg>

          <div>
            <p className="text-lg text-text-secondary font-medium tracking-tight">
              No code changes yet
            </p>
            <p className="text-sm text-text-muted mt-1 max-w-[40ch]">
              The pipeline generates code after tests pass.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            disabled
            className="
              mt-2 px-4 py-2 rounded-[--radius-button]
              bg-transparent border border-border text-text-secondary text-sm
              hover:bg-surface-1 hover:border-border
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors cursor-pointer
            "
          >
            Run pipeline
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl tracking-tight font-medium text-text-primary">
          Generated Code
        </h2>
        <p className="text-xs text-text-muted mt-1">
          <span className="font-mono tabular-nums text-text-secondary">
            {codeChanges.length}
          </span>
          {" "}file{codeChanges.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* File list -- double bezel container */}
      <div className="bezel">
        <div className="bezel-inner divide-y divide-border">
          {codeChanges.map((file, index) => {
            const type = getFileType(file);

            return (
              <motion.div
                key={file}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                {/* File type SVG icon */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <FileIcon type={type} />
                </div>

                {/* File path */}
                <span className="text-[11px] font-mono text-text-secondary flex-1 min-w-0 truncate">
                  {file}
                </span>

                {/* View link (disabled for now) */}
                <button
                  disabled
                  className="
                    text-[11px] text-accent/40
                    cursor-not-allowed
                  "
                >
                  View
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
