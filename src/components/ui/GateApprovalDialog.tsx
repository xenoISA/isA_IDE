import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

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
    title: "Tests Pass -- Deploy?",
    description:
      "All test layers are passing. Approve to move forward with deployment.",
  },
  deploy_success: {
    title: "Deployment Ready",
    description:
      "Deployment artifacts are built and verified. Approve to finalize and ship.",
  },
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4">
      <path
        d="M13.5 4.5l-7 7L3 8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4">
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Card */}
        <motion.div
          className="relative w-full max-w-md mx-4 bezel"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="bezel-inner p-6">
            <h2 className="text-base font-semibold text-text-primary">
              {meta.title}
            </h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {meta.description}
            </p>

            {/* Reject feedback area */}
            <AnimatePresence>
              {showReject && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mt-4 bezel">
                    <textarea
                      autoFocus
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="What needs to change?"
                      className="w-full bg-surface-1 rounded-[var(--radius-inner)] px-3 py-2 text-sm text-text-primary placeholder:text-text-ghost focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-3">
              <motion.button
                onClick={handleReject}
                className="flex items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                whileTap={{ scale: 0.97 }}
              >
                <XIcon />
                {showReject ? "Submit Rejection" : "Reject"}
              </motion.button>
              <motion.button
                onClick={onApprove}
                className="flex items-center gap-1.5 rounded-[var(--radius-button)] bg-accent text-bg px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                whileTap={{ scale: 0.97 }}
              >
                <CheckIcon />
                Approve
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
