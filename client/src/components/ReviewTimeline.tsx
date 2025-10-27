import { ChevronDown, ChevronUp, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReviewBadge from "./ReviewBadge";
import type { AiInteractionWithDetails } from "@shared/schema";
import { format } from "date-fns";

interface ReviewTimelineProps {
  interactions: AiInteractionWithDetails[];
}

export default function ReviewTimeline({ interactions }: ReviewTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (interactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquareText className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No interactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="review-timeline">
      {interactions.map((interaction) => {
        const isExpanded = expandedIds.has(interaction.id);
        const hasReviews = interaction.reviews && interaction.reviews.length > 0;

        return (
          <Card key={interaction.id} className="border-b" data-testid={`card-interaction-${interaction.id}`}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {format(new Date(interaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">
                    {interaction.child.name}
                  </p>
                </div>
                <button
                  data-testid={`button-expand-${interaction.id}`}
                  onClick={() => toggleExpanded(interaction.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Parent Concern Preview/Full */}
              <div className="mb-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Parent Concern
                </p>
                <p className={`text-sm text-foreground ${!isExpanded && 'line-clamp-2'}`}>
                  {interaction.parentConcern}
                </p>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      AI Response
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {interaction.aiResponse}
                    </p>
                  </div>

                  {interaction.conversationContext && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        Context
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {interaction.conversationContext}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews */}
              {hasReviews && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  {interaction.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-muted/50 rounded-lg p-3"
                      data-testid={`review-${review.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {review.providerName}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground">
                            {format(new Date(review.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <ReviewBadge decision={review.reviewDecision as any} />
                      </div>
                      {review.providerNotes && (
                        <div className="mt-2">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                            Provider Notes
                          </p>
                          <p className="text-sm text-foreground">
                            {review.providerNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!hasReviews && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    No provider review yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
