import { motion } from "framer-motion";

interface TeamBadgeProps {
  team: string;
  isActive: boolean;
}

const TEAM_LABELS: Record<string, string> = {
  product_team: "Product Team",
  dev_team: "Dev Team",
  ops_team: "Ops Team",
};

export function TeamBadge({ team, isActive }: TeamBadgeProps) {
  const label = TEAM_LABELS[team] ?? team;

  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
      <span className="text-sm text-text-secondary">{label}</span>
      {isActive && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-accent"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
