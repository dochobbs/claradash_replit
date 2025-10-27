import { Check, MessageSquare, X, AlertTriangle } from "lucide-react";

interface ReviewBadgeProps {
  decision: "agree" | "agree_with_thoughts" | "disagree" | "needs_escalation";
  className?: string;
}

const badgeConfig = {
  agree: {
    label: "Agree",
    icon: Check,
    className: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  agree_with_thoughts: {
    label: "Agree w/ Thoughts",
    icon: MessageSquare,
    className: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  disagree: {
    label: "Disagree",
    icon: X,
    className: "bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  },
  needs_escalation: {
    label: "Needs Escalation",
    icon: AlertTriangle,
    className: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  },
};

export default function ReviewBadge({ decision, className = "" }: ReviewBadgeProps) {
  const config = badgeConfig[decision];
  const Icon = config.icon;

  return (
    <span
      data-testid={`badge-${decision}`}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 
        rounded-full text-xs font-semibold border
        ${config.className} ${className}
      `}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
