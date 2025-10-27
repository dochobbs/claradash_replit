import { useQuery, useMutation } from "@tanstack/react-query";
import { ClipboardList, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import ReviewTimeline from "@/components/ReviewTimeline";
import ReviewSubmissionForm from "@/components/ReviewSubmissionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { AiInteractionWithDetails, InsertProviderReview } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Reviews() {
  const [selectedInteraction, setSelectedInteraction] = useState<AiInteractionWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: allInteractions, isLoading } = useQuery<AiInteractionWithDetails[]>({
    queryKey: ["/api/interactions"],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: InsertProviderReview) => {
      return await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsDialogOpen(false);
      setSelectedInteraction(null);
      toast({
        title: "Review Submitted",
        description: "Your review has been successfully documented.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pendingInteractions = allInteractions?.filter(
    (interaction) => !interaction.reviews || interaction.reviews.length === 0
  ) || [];

  const reviewedInteractions = allInteractions?.filter(
    (interaction) => interaction.reviews && interaction.reviews.length > 0
  ) || [];

  const handleReviewClick = (interaction: AiInteractionWithDetails) => {
    setSelectedInteraction(interaction);
    setIsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Review AI interactions and document clinical assessments
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending Review
              {pendingInteractions.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                  {pendingInteractions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed" data-testid="tab-reviewed">
              Reviewed
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              All Interactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold">Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : pendingInteractions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-pending-reviews">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">
                      No pending reviews
                    </p>
                    <p className="text-xs text-muted-foreground">
                      All interactions have been reviewed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingInteractions.map((interaction) => (
                      <Card key={interaction.id} className="border-l-4 border-l-amber-500" data-testid={`card-pending-${interaction.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
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
                            </div>
                            <Button
                              size="sm"
                              data-testid={`button-review-${interaction.id}`}
                              onClick={() => handleReviewClick(interaction)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Review
                            </Button>
                          </div>
                          <div className="mb-2">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                              Parent Concern
                            </p>
                            <p className="text-sm text-foreground line-clamp-2">
                              {interaction.parentConcern}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviewed">
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold">Reviewed Interactions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (
                  <ReviewTimeline interactions={reviewedInteractions} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold">All Interactions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : allInteractions ? (
                  <ReviewTimeline interactions={allInteractions} />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Provider Review</DialogTitle>
            </DialogHeader>

            {selectedInteraction && (
              <div className="space-y-6">
                {/* AI Interaction Card */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {selectedInteraction.child.name}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedInteraction.patient.name}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Parent Concern
                        </p>
                        <p className="text-sm text-foreground">
                          {selectedInteraction.parentConcern}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          AI Response
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {selectedInteraction.aiResponse}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Form */}
                <ReviewSubmissionForm
                  interactionId={selectedInteraction.id}
                  onSubmit={(data) => submitReviewMutation.mutate(data)}
                  isSubmitting={submitReviewMutation.isPending}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
