import { User, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PatientWithChildren } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface PatientCardProps {
  patient: PatientWithChildren;
  interactionCount?: number;
  lastReviewDate?: Date;
  status?: "active" | "review_pending" | "escalated";
  onClick?: () => void;
}

const statusConfig = {
  active: {
    label: "Active",
    className: "border-l-emerald-500 dark:border-l-emerald-600",
  },
  review_pending: {
    label: "Review Pending",
    className: "border-l-amber-500 dark:border-l-amber-600",
  },
  escalated: {
    label: "Escalated",
    className: "border-l-red-500 dark:border-l-red-600",
  },
};

export default function PatientCard({ 
  patient, 
  interactionCount = 0, 
  lastReviewDate,
  status = "active",
  onClick 
}: PatientCardProps) {
  const config = statusConfig[status];

  return (
    <Card
      data-testid={`card-patient-${patient.id}`}
      onClick={onClick}
      className={`
        border-l-4 cursor-pointer
        transition-all duration-200
        hover:shadow-md hover:scale-[1.01]
        ${config.className}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground" data-testid={`text-patient-name-${patient.id}`}>
                {patient.name}
              </h3>
              <p className="text-xs text-muted-foreground">{patient.email}</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
            {config.label}
          </span>
        </div>

        {patient.children && patient.children.length > 0 && (
          <div className="mb-3 pt-3 border-t border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
              Children
            </p>
            <div className="space-y-1">
              {patient.children.map((child) => (
                <div key={child.id} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{child.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    MRN: {child.medicalRecordNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Interactions
              </p>
              <p className="text-sm font-semibold text-foreground" data-testid={`text-interaction-count-${patient.id}`}>
                {interactionCount}
              </p>
            </div>
            {lastReviewDate && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Last Review
                </p>
                <div className="flex items-center gap-1 text-sm text-foreground">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs">
                    {formatDistanceToNow(lastReviewDate, { addSuffix: true })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
