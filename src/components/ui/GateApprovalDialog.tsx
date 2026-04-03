import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type GateType = "cdd_complete" | "tests_pass" | "deploy_success";

interface GateApprovalDialogProps {
  gate: GateType;
  onApprove: () => void;
  onReject: (feedback: string) => void;
}

const GATE_META: Record<GateType, { title: string; description: string }> = {
  cdd_complete: {
    title: "Approve Contracts?",
    description:
      "All CDD contract layers have been generated. Review and approve to proceed to the development phase.",
  },
  tests_pass: {
    title: "Tests Pass \u2014 Deploy?",
    description:
      "All test layers are passing. Approve to move forward with deployment.",
  },
  deploy_success: {
    title: "Deployment Ready",
    description:
      "Deployment artifacts are built and verified. Approve to finalize and ship.",
  },
};

export function GateApprovalDialog({
  gate,
  onApprove,
  onReject,
}: GateApprovalDialogProps) {
  const [showReject, setShowReject] = useState(false);
  const [feedback, setFeedback] = useState("");

  const meta = GATE_META[gate];

  const handleReject = useCallback(() => {
    if (!showReject) {
      setShowReject(true);
      return;
    }
    onReject(feedback);
  }, [showReject, feedback, onReject]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !showReject) {
        e.preventDefault();
        onApprove();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (showReject) {
          setShowReject(false);
          setFeedback("");
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onApprove, showReject]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Card */}
      <div className="relative w-full max-w-md mx-4 rounded-lg border border-border bg-surface-2 p-6 shadow-xl">
        <h2 className="text-base font-semibold text-text-primary">
          {meta.title}
        </h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {meta.description}
        </p>

        {/* Reject feedback area */}
        {showReject && (
          <textarea
            autoFocus
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What needs to change?"
            className="mt-4 w-full rounded border border-border bg-surface-1 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-stage-intent resize-none"
            rows={3}
          />
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={handleReject}
            className="rounded px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-1 transition-colors cursor-pointer"
          >
            {showReject ? "Submit Rejection" : "Reject"}
          </button>
          <button
            onClick={onApprove}
            className="rounded px-4 py-1.5 text-xs font-semibold bg-gate-complete text-surface-0 hover:brightness-110 transition-colors cursor-pointer"
          >
            Approve
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
