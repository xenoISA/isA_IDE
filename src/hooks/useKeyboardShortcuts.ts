import { useEffect } from "react";
import type { Stage } from "@/lib/types";

const STAGE_ORDER: Stage[] = ["intent", "cdd", "tdd", "code", "ship"];

interface ShortcutCallbacks {
  onStageChange?: (stage: Stage) => void;
  onGo?: () => void;
  onToggleInspector?: () => void;
  onStop?: () => void;
}

export function useKeyboardShortcuts(callbacks: ShortcutCallbacks) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      // Cmd+1 through Cmd+5: switch stages
      if (meta && e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        const index = parseInt(e.key, 10) - 1;
        if (index < STAGE_ORDER.length && callbacks.onStageChange) {
          callbacks.onStageChange(STAGE_ORDER[index]);
        }
        return;
      }

      // Cmd+Enter: trigger Go
      if (meta && e.key === "Enter") {
        e.preventDefault();
        callbacks.onGo?.();
        return;
      }

      // Cmd+\: toggle inspector
      if (meta && e.key === "\\") {
        e.preventDefault();
        callbacks.onToggleInspector?.();
        return;
      }

      // Esc: stop/cancel
      if (e.key === "Escape") {
        e.preventDefault();
        callbacks.onStop?.();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callbacks]);
}
