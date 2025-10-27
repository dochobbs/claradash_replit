import { useQuery } from "@tanstack/react-query";
import { 
  ClipboardList, AlertTriangle, Users, Activity, 
  MessageSquare, CheckCircle2, XCircle, Clock
} from "lucide-react";
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
    agreesCount: number;
    disagreesCount: number;
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

        {/* Stats Grid - Enhanced with Review Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Review Outcomes</p>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold" data-testid="stat-agrees">{stats?.agreesCount || 0}</span>
                          <span className="text-xs text-muted-foreground">Agrees</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-coral" />
                          <span className="text-lg font-bold" data-testid="stat-disagrees">{stats?.disagreesCount || 0}</span>
                          <span className="text-xs text-muted-foreground">Disagrees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions - Distinct Functions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/reviews">
                <Button variant="outline" className="w-full justify-start h-auto flex-col items-start p-4" data-testid="button-start-reviewing">
                  <div className="flex items-center mb-1">
                    <ClipboardList className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="font-medium">Start Reviewing</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats?.reviewsPending ? `${stats.reviewsPending} cases awaiting review` : 'Review Clara AI assessments'}
                  </span>
                </Button>
              </Link>
              <Link href="/escalations">
                <Button variant="outline" className="w-full justify-start h-auto flex-col items-start p-4" data-testid="button-manage-escalations">
                  <div className="flex items-center mb-1">
                    <MessageSquare className="w-4 h-4 mr-2 text-coral" />
                    <span className="font-medium">Manage Escalations</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats?.escalations ? `${stats.escalations} active conversations` : 'Message with parents'}
                  </span>
                </Button>
              </Link>
              <Link href="/patients">
                <Button variant="outline" className="w-full justify-start h-auto flex-col items-start p-4" data-testid="button-patient-list">
                  <div className="flex items-center mb-1">
                    <Users className="w-4 h-4 mr-2 text-teal" />
                    <span className="font-medium">Browse Patients</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    View medical histories
                  </span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start h-auto flex-col items-start p-4 cursor-not-allowed opacity-50" data-testid="button-recent-activity">
                <div className="flex items-center mb-1">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">Recent Activity</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Your review history (Coming Soon)
                </span>
              </Button>
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