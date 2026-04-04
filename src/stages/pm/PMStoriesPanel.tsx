import { motion } from "framer-motion";
import type { UserStory, AcceptanceCriterion } from "@/lib/types";

interface PMStoriesPanelProps {
  stories: UserStory[];
}

/* ─── SVG Icons ──────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-pass shrink-0">
      <path
        d="M13 4.5l-6.5 7L3 8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FailIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-fail shrink-0">
      <path
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-text-ghost shrink-0">
      <circle
        cx="8"
        cy="8"
        r="5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

/* ─── Helpers ────────────────────────────────────────────────── */

function criterionIcon(status: AcceptanceCriterion["status"]) {
  if (status === "pass") return <CheckIcon />;
  if (status === "fail") return <FailIcon />;
  return <PendingIcon />;
}

function deriveStatus(criteria: AcceptanceCriterion[]): {
  label: string;
  className: string;
} {
  if (criteria.length === 0) {
    return { label: "No Criteria", className: "text-text-muted border-border" };
  }
  if (criteria.every((c) => c.status === "pass")) {
    return { label: "Complete", className: "text-pass border-pass/30" };
  }
  if (criteria.some((c) => c.status === "fail")) {
    return { label: "Needs Work", className: "text-fail border-fail/30" };
  }
  return { label: "In Progress", className: "text-warn border-warn/30" };
}

/* ─── Stagger animation ─────────────────────────────────────── */

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ─── Component ──────────────────────────────────────────────── */

export function PMStoriesPanel({ stories }: PMStoriesPanelProps) {
  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-text-muted">
          No user stories generated yet. Run the pipeline to extract stories
          from your PRD.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stories.map((story) => {
        const status = deriveStatus(story.criteria);

        return (
          <motion.div key={story.id} className="bezel" variants={item}>
            <div className="bezel-inner px-5 py-4 relative">
              {/* Header: ID pill + status badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">
                  {story.id}
                </span>
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Story sentence */}
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                As{" "}
                <span className="text-text-primary font-medium">
                  {story.as}
                </span>
                , I want{" "}
                <span className="text-text-primary font-medium">
                  {story.want}
                </span>
                , so that{" "}
                <span className="text-text-primary font-medium">
                  {story.soThat}
                </span>
                .
              </p>

              {/* Acceptance criteria checklist */}
              {story.criteria.length > 0 && (
                <div className="space-y-2">
                  {story.criteria.map((criterion, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="mt-0.5">{criterionIcon(criterion.status)}</span>
                      <span
                        className={`text-xs leading-relaxed ${
                          criterion.status === "pass"
                            ? "text-text-secondary"
                            : criterion.status === "fail"
                              ? "text-text-secondary"
                              : "text-text-muted"
                        }`}
                      >
                        {criterion.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
