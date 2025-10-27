import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
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

        {/* Coming Soon Placeholder */}
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Comprehensive analytics for evaluating provider performance and AI accuracy will be available here.
                Track review patterns, response times, escalation rates, and more.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
