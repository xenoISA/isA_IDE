import type { Gates } from "@/lib/types";

interface GateProgressProps {
  gates: Gates;
}

const GATE_ITEMS: { key: keyof Gates; label: string; stage: string }[] = [
  { key: "cdd_complete", label: "Contracts Ready", stage: "CDD" },
  { key: "tests_pass", label: "Tests Pass", stage: "TDD" },
  { key: "deploy_success", label: "Deployed", stage: "Ship" },
];

export function GateProgress({ gates }: GateProgressProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-text-secondary">Pipeline Gates</h4>
      {GATE_ITEMS.map((item, i) => {
        const complete = gates[item.key];
        return (
          <div key={item.key}>
            <div className="flex items-center gap-2">
              {/* Gate circle */}
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${complete
                    ? "bg-gate-complete text-surface-0"
                    : "bg-surface-2 text-text-muted border border-border"
                  }
                `}
              >
                {complete ? "✓" : i + 1}
              </div>

              {/* Label */}
              <div>
                <p
                  className={`text-xs font-medium ${
                    complete ? "text-gate-complete" : "text-text-secondary"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-[10px] text-text-muted">{item.stage}</p>
              </div>
            </div>

            {/* Connector */}
            {i < GATE_ITEMS.length - 1 && (
              <div
                className="w-px h-3 ml-3"
                style={{
                  background: complete
                    ? "var(--color-gate-complete)"
                    : "var(--color-border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
