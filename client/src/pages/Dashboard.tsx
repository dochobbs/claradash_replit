import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ClipboardList, AlertTriangle, Users, Activity, 
  MessageSquare, CheckCircle2, XCircle, Clock, Database
} from "lucide-react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Provider name for demo
const PROVIDER_NAME = "Dr. Sarah Chen";

export default function Dashboard() {
  const { toast } = useToast();
  const [showInitButton, setShowInitButton] = useState(false);

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

  // Check if database is empty (show init button if no patients)
  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
    onSuccess: (data: any) => {
      setShowInitButton(data?.length === 0);
    }
  });

  // Initialize data mutation
  const initializeData = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/initialize-data', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Data Initialized",
        description: `Successfully added ${data.stats.patients} patients, ${data.stats.children} children, ${data.stats.interactions} interactions, and ${data.stats.reviews} reviews.`,
      });
      // Invalidate all queries to refresh the data
      queryClient.invalidateQueries();
      setShowInitButton(false);
    },
    onError: (error: any) => {
      toast({
        title: "Initialization Failed",
        description: error.message || "Failed to initialize sample data",
        variant: "destructive",
      });
    },
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
            <p className="text-sm text-muted-foreground">
              Clinical AI Review Dashboard
            </p>
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

            {/* Initialize Data Button - Only shows when database is empty */}
            {showInitButton && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Database is empty. Initialize with sample data for demo purposes.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => initializeData.mutate()}
                  disabled={initializeData.isPending}
                  data-testid="button-initialize-data"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {initializeData.isPending ? "Initializing..." : "Initialize Sample Data"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}