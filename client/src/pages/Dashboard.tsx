import { useQuery } from "@tanstack/react-query";
import { ClipboardList, AlertTriangle, Clock, Users } from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReviewBadge from "@/components/ReviewBadge";
import { Link } from "wouter";
import type { AiInteractionWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    reviewsPending: number;
    escalations: number;
    activePatients: number;
    avgResponseTime: string;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: recentInteractions, isLoading: interactionsLoading } = useQuery<AiInteractionWithDetails[]>({
    queryKey: ["/api/interactions/recent"],
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Provider Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Clinical AI review workbench and EMR documentation
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                label="Reviews Pending"
                value={stats?.reviewsPending || 0}
                icon={ClipboardList}
                testId="stat-reviews-pending"
              />
              <StatCard
                label="Escalations"
                value={stats?.escalations || 0}
                icon={AlertTriangle}
                testId="stat-escalations"
              />
              <StatCard
                label="Avg Response Time"
                value={stats?.avgResponseTime || "N/A"}
                icon={Clock}
                testId="stat-avg-response"
              />
              <StatCard
                label="Active Patients"
                value={stats?.activePatients || 0}
                icon={Users}
                testId="stat-active-patients"
              />
            </>
          )}
        </div>

        {/* Recent Reviews */}
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Interactions</CardTitle>
              <Link href="/reviews">
                <Button variant="outline" size="sm" data-testid="button-view-all">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {interactionsLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : !recentInteractions || recentInteractions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-recent-interactions">
                <ClipboardList className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No recent interactions</p>
                <p className="text-xs text-muted-foreground">
                  New AI interactions will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentInteractions.slice(0, 10).map((interaction) => {
                  const latestReview = interaction.reviews?.[0];
                  
                  return (
                    <div
                      key={interaction.id}
                      data-testid={`row-interaction-${interaction.id}`}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {interaction.child.name}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {interaction.patient.name}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            {format(new Date(interaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        {latestReview ? (
                          <ReviewBadge decision={latestReview.reviewDecision as any} />
                        ) : (
                          <span className="text-xs px-2 py-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Pending Review
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {interaction.parentConcern}
                      </p>
                      {latestReview && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            Reviewed by <span className="font-medium">{latestReview.providerName}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
