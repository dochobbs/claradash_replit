import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const { data: analyticsData, isLoading } = useQuery<{
    reviewOutcomes: { name: string; value: number; color: string }[];
    timeMetrics: { 
      name: string; 
      waitTime: number; 
      reviewTime: number; 
      escalationTime: number;
    }[];
    stats: {
      totalReviews: number;
      avgWaitTime: number;
      avgReviewTime: number;
      avgEscalationTime: number;
    };
  }>({
    queryKey: ["/api/analytics"],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Provider performance metrics and software evaluation
          </p>
        </div>

        <div className="grid gap-6">
          {/* Review Outcomes Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Review Outcomes Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.reviewOutcomes || [
                        { name: "Agree", value: 31, color: "#FFD54F" },
                        { name: "Agree with Thoughts", value: 12, color: "#26A69A" },
                        { name: "Disagree", value: 17, color: "#FF6B6B" },
                        { name: "Needs Escalation", value: 5, color: "#EF5350" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(analyticsData?.reviewOutcomes || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Time Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Time Metrics Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Avg Wait Time</p>
                      <p className="text-lg font-bold text-foreground">
                        {analyticsData?.stats?.avgWaitTime || 15}m
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Avg Review Time</p>
                      <p className="text-lg font-bold text-foreground">
                        {analyticsData?.stats?.avgReviewTime || 8}m
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Avg Escalation Time</p>
                      <p className="text-lg font-bold text-foreground">
                        {analyticsData?.stats?.avgEscalationTime || 45}m
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analyticsData?.timeMetrics || [
                        { name: "Mon", waitTime: 12, reviewTime: 8, escalationTime: 35 },
                        { name: "Tue", waitTime: 18, reviewTime: 10, escalationTime: 42 },
                        { name: "Wed", waitTime: 15, reviewTime: 7, escalationTime: 38 },
                        { name: "Thu", waitTime: 20, reviewTime: 9, escalationTime: 50 },
                        { name: "Fri", waitTime: 14, reviewTime: 6, escalationTime: 45 },
                        { name: "Sat", waitTime: 10, reviewTime: 5, escalationTime: 30 },
                        { name: "Sun", waitTime: 8, reviewTime: 4, escalationTime: 25 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: "Time (minutes)", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="waitTime" fill="#FFD54F" name="Wait Time" />
                      <Bar dataKey="reviewTime" fill="#26A69A" name="Review Time" />
                      <Bar dataKey="escalationTime" fill="#FF6B6B" name="Escalation Time" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
