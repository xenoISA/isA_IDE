import type { CDDLayer } from "@/lib/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface LayerContentProps {
  layer: CDDLayer;
  content: string;
  loading?: boolean;
}

export function LayerContent({ layer, content, loading = false }: LayerContentProps) {
  if (loading) {
    return (
      <div className="py-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-running animate-pulse" />
        <span className="text-xs text-text-muted">Generating layer content...</span>
      </div>
    );
  }

  // L4 (data_contract) renders as a Python code block
  if (layer === "data_contract") {
    return (
      <div className="py-3">
        <pre className="bg-surface-2 rounded-lg p-4 overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed">
          <code>{content}</code>
        </pre>
      </div>
    );
  }

  // L1-L3 (domain, prd, design) and L5-L6 (logic_contract, system_contract) render as markdown
  return (
    <div className="py-3">
      <MarkdownRenderer content={content} />
    </div>
  );
}
