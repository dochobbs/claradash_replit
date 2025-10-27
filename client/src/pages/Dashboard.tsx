import { useQuery } from "@tanstack/react-query";
import { ClipboardList, AlertTriangle, Users, Activity } from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";

// Provider name for demo
const PROVIDER_NAME = "Dr. Sarah Chen";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    reviewsPending: number;
    escalations: number;
    activePatients: number;
    avgResponseTime: string;
  }>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'Good morning' : currentTime.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Greeting */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {greeting}, {PROVIDER_NAME}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-2">
              Clinical AI Review Dashboard
            </p>
            <div className="flex gap-2 justify-end">
              <Link href="/reviews">
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-review-queue">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Review Queue
                  {stats?.reviewsPending && stats.reviewsPending > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white text-primary">
                      {stats.reviewsPending}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
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
                className="border-l-4 border-l-yellow-500"
              />
              <StatCard
                label="Active Escalations"
                value={stats?.escalations || 0}
                icon={AlertTriangle}
                testId="stat-escalations"
                className="border-l-4 border-l-coral"
              />
              <StatCard
                label="Active Patients"
                value={stats?.activePatients || 0}
                icon={Users}
                testId="stat-active-patients"
                className="border-l-4 border-l-teal"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/reviews">
                <Button variant="outline" className="w-full justify-start" data-testid="button-pending-reviews">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View Pending Reviews
                  {stats?.reviewsPending && stats.reviewsPending > 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                      {stats.reviewsPending}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/patients">
                <Button variant="outline" className="w-full justify-start" data-testid="button-patient-list">
                  <Users className="w-4 h-4 mr-2" />
                  Patient List
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start" data-testid="button-analytics">
                  <Activity className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">Clara AI</span>
                </div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">EMR System</span>
                </div>
                <span className="text-xs text-muted-foreground">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">Messaging Service</span>
                </div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}