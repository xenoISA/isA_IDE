import { lazy, Suspense } from "react";

const MonacoEditor = lazy(() =>
  import("@monaco-editor/react").then((m) => ({ default: m.default }))
);

interface CodeViewerProps {
  content: string;
  language: string;
  filename?: string;
  height?: string;
}

function LoadingSkeleton() {
  return (
    <div className="bezel">
      <div className="bezel-inner p-4 space-y-3">
        {/* Simulated code lines with shimmer */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="h-3 rounded bg-surface-2 animate-pulse"
              style={{ width: `${20 + ((i * 37) % 40)}px` }}
            />
            <div
              className="h-3 rounded bg-surface-2 animate-pulse"
              style={{
                width: `${60 + ((i * 53) % 200)}px`,
                animationDelay: `${i * 75}ms`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerIsaTheme(monacoInstance: any) {
  const m = monacoInstance as {
    editor: {
      defineTheme: (name: string, theme: Record<string, unknown>) => void;
    };
  };

  m.editor.defineTheme("isa-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "a1a1aa" },
      { token: "comment", foreground: "52525b", fontStyle: "italic" },
      { token: "keyword", foreground: "34d399" },
      { token: "string", foreground: "fbbf24" },
      { token: "number", foreground: "60a5fa" },
      { token: "type", foreground: "34d399" },
      { token: "function", foreground: "60a5fa" },
      { token: "variable", foreground: "a1a1aa" },
      { token: "operator", foreground: "71717a" },
      { token: "delimiter", foreground: "71717a" },
      { token: "tag", foreground: "34d399" },
      { token: "attribute.name", foreground: "60a5fa" },
      { token: "attribute.value", foreground: "fbbf24" },
    ],
    colors: {
      "editor.background": "#0a0a0b",
      "editor.foreground": "#a1a1aa",
      "editor.lineHighlightBackground": "#18181b",
      "editor.selectionBackground": "#27272a",
      "editor.inactiveSelectionBackground": "#18181b",
      "editorLineNumber.foreground": "#3f3f46",
      "editorLineNumber.activeForeground": "#71717a",
      "editorCursor.foreground": "#34d399",
      "editorIndentGuide.background": "#1a1a1e",
      "editorIndentGuide.activeBackground": "#27272a",
      "editor.selectionHighlightBackground": "#27272a80",
      "editorBracketMatch.background": "#27272a",
      "editorBracketMatch.border": "#3f3f46",
      "scrollbarSlider.background": "#ffffff14",
      "scrollbarSlider.hoverBackground": "#ffffff26",
      "editorWidget.background": "#0a0a0b",
      "editorWidget.border": "#ffffff0f",
    },
  });
}

export function CodeViewer({
  content,
  language,
  filename,
  height = "400px",
}: CodeViewerProps) {
  return (
    <div className="code-viewer-wrapper">
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          <span className="text-[11px] font-mono text-text-muted truncate">
            {filename}
          </span>
        </div>
      )}
      <Suspense fallback={<LoadingSkeleton />}>
        <MonacoEditor
          height={height}
          language={language}
          value={content}
          theme="isa-dark"
          beforeMount={registerIsaTheme}
          options={{
            readOnly: true,
            fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
            lineHeight: 20,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            renderLineHighlight: "gutter",
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
            },
            padding: { top: 12, bottom: 12 },
            contextmenu: false,
            folding: true,
            links: false,
            matchBrackets: "always",
            guides: {
              indentation: true,
              bracketPairs: false,
            },
          }}
        />
      </Suspense>
    </div>
  );
}
