interface TeamBadgeProps {
  team: string;
  isActive: boolean;
}

const TEAM_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  product_team: {
    label: "Product Team",
    color: "var(--color-stage-cdd)",
    icon: "P",
  },
  dev_team: {
    label: "Dev Team",
    color: "var(--color-stage-tdd)",
    icon: "D",
  },
  ops_team: {
    label: "Ops Team",
    color: "var(--color-stage-ship)",
    icon: "O",
  },
};

export function TeamBadge({ team, isActive }: TeamBadgeProps) {
  const config = TEAM_CONFIG[team] ?? {
    label: team,
    color: "var(--color-text-muted)",
    icon: "?",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-surface-0"
        style={{ background: config.color }}
      >
        {config.icon}
      </div>
      <span className="text-xs text-text-secondary">{config.label}</span>
      {isActive && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: config.color }}
        />
      )}
    </div>
  );
}
