import { motion } from "framer-motion";
import type { UserStory, AcceptanceCriterion } from "@/lib/types";

interface PMStoriesPanelProps {
  stories: UserStory[];
}

/* ─── SVG Icons ──────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-pass shrink-0">
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
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-fail shrink-0">
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
    <svg viewBox="0 0 16 16" className="w-4 h-4 text-text-ghost shrink-0">
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
  badgeClass: string;
  borderClass: string;
} {
  if (criteria.length === 0) {
    return {
      label: "No Criteria",
      badgeClass: "text-text-muted border-border",
      borderClass: "border-l-2 border-l-border",
    };
  }
  if (criteria.every((c) => c.status === "pass")) {
    return {
      label: "Complete",
      badgeClass: "text-pass border-pass/30",
      borderClass: "border-l-2 border-l-accent",
    };
  }
  if (criteria.some((c) => c.status === "fail")) {
    return {
      label: "Needs Work",
      badgeClass: "text-fail border-fail/30",
      borderClass: "border-l-2 border-l-fail",
    };
  }
  return {
    label: "In Progress",
    badgeClass: "text-warn border-warn/30",
    borderClass: "border-l-2 border-l-warn",
  };
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
      className="max-w-3xl space-y-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stories.map((story) => {
        const status = deriveStatus(story.criteria);

        return (
          <motion.div
            key={story.id}
            className={`bezel ${status.borderClass} rounded-l-none`}
            variants={item}
          >
            <div className="bezel-inner px-5 py-4 relative">
              {/* Header: ID pill + status badge (same row) */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-text-muted bg-surface-2 px-2.5 py-1 rounded-full">
                  {story.id}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.badgeClass}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Story sentence — structured three-line layout */}
              <div className="mb-4 space-y-1">
                <p className="text-sm text-text-secondary leading-relaxed">
                  <span className="text-text-muted">As</span>{" "}
                  <span className="font-medium text-text-primary">
                    {story.as}
                  </span>
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  <span className="text-text-muted">I want</span>{" "}
                  <span className="font-medium text-text-primary">
                    {story.want}
                  </span>
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  <span className="text-text-muted">So that</span>{" "}
                  <span className="font-medium text-text-primary">
                    {story.soThat}
                  </span>
                </p>
              </div>

              {/* Acceptance criteria checklist */}
              {story.criteria.length > 0 && (
                <div className="space-y-2.5">
                  {story.criteria.map((criterion, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="mt-0.5">{criterionIcon(criterion.status)}</span>
                      <span
                        className={`text-sm leading-relaxed ${
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
