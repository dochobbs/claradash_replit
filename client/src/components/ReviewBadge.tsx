import { Check, MessageSquare, X, AlertTriangle } from "lucide-react";

interface ReviewBadgeProps {
  decision: "agree" | "agree_with_thoughts" | "disagree" | "needs_escalation";
  className?: string;
}

const badgeConfig = {
  agree: {
    label: "Agree",
    icon: Check,
    className: "bg-[hsl(42,70%,92%)] dark:bg-[hsl(42,70%,15%)] text-[hsl(42,70%,30%)] dark:text-[hsl(42,70%,70%)] border-[hsl(42,70%,80%)] dark:border-[hsl(42,70%,25%)]",
  },
  agree_with_thoughts: {
    label: "Agree w/ Thoughts",
    icon: MessageSquare,
    className: "bg-[hsl(170,45%,92%)] dark:bg-[hsl(170,45%,15%)] text-[hsl(170,45%,30%)] dark:text-[hsl(170,45%,65%)] border-[hsl(170,45%,80%)] dark:border-[hsl(170,45%,25%)]",
  },
  disagree: {
    label: "Disagree",
    icon: X,
    className: "bg-[hsl(0,0%,90%)] dark:bg-[hsl(0,0%,18%)] text-[hsl(0,0%,35%)] dark:text-[hsl(0,0%,70%)] border-[hsl(0,0%,78%)] dark:border-[hsl(0,0%,28%)]",
  },
  needs_escalation: {
    label: "Needs Escalation",
    icon: AlertTriangle,
    className: "bg-[hsl(7,73%,92%)] dark:bg-[hsl(7,73%,18%)] text-[hsl(7,73%,35%)] dark:text-[hsl(7,73%,70%)] border-[hsl(7,73%,80%)] dark:border-[hsl(7,73%,30%)]",
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
