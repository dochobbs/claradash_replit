import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { 
  AlertCircle, Clock, MessageSquare, ChevronRight, 
  Activity, Pill, AlertTriangle, ClipboardList,
  User, Phone, Mail, Calendar, Hash, Weight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import type { AiInteractionWithDetails, InsertProviderReview } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Provider name for demo
const PROVIDER_NAME = "Dr. Sarah Chen";

export default function ReviewWorkbench() {
  const { toast } = useToast();
  const [selectedInteraction, setSelectedInteraction] = useState<AiInteractionWithDetails | null>(null);
  const [reviewDecision, setReviewDecision] = useState<string>("");
  const [providerNotes, setProviderNotes] = useState("");
  const [icd10Code, setIcd10Code] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: interactions, isLoading } = useQuery<AiInteractionWithDetails[]>({
    queryKey: ["/api/interactions"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: childMedicalData } = useQuery<{
    medications: any[];
    allergies: any[];
    problemList: any[];
  }>({
    queryKey: selectedInteraction ? [`/api/children/${selectedInteraction.childId}/medical`] : [],
    enabled: !!selectedInteraction,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: InsertProviderReview) => {
      return await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Review Submitted",
        description: "Your assessment has been documented.",
      });
      // Clear form
      setReviewDecision("");
      setProviderNotes("");
      setIcd10Code("");
      // Move to next pending if available
      const nextPending = pendingInteractions.find(i => i.id !== selectedInteraction?.id);
      if (nextPending) {
        setSelectedInteraction(nextPending);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pendingInteractions = interactions?.filter(
    (i) => !i.reviews || i.reviews.length === 0
  ) || [];

  const handleSubmitReview = () => {
    if (!selectedInteraction || !reviewDecision) return;

    submitReviewMutation.mutate({
      interactionId: selectedInteraction.id,
      providerName: PROVIDER_NAME,
      reviewDecision: reviewDecision as any,
      providerNotes: providerNotes || null,
      icd10Code: icd10Code || null,
    });
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTimeInQueueColor = (interaction: AiInteractionWithDetails) => {
    if (!interaction.queuedAt) return '';
    const hoursInQueue = (Date.now() - new Date(interaction.queuedAt).getTime()) / (1000 * 60 * 60);
    
    if (hoursInQueue > 2) return 'text-red-600 dark:text-red-400';
    if (hoursInQueue > 1) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-3.5rem)] bg-background">
        {/* Main Content - Three Panels */}
        <div className="flex flex-1">
        {/* Left Panel - Review Queue */}
        <div className="w-96 border-r border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Review Queue</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {pendingInteractions.length} pending • {interactions?.length || 0} total
            </p>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-3">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))
              ) : pendingInteractions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground">No pending reviews</p>
                </div>
              ) : (
                pendingInteractions.map((interaction) => (
                  <Card 
                    key={interaction.id}
                    className={`cursor-pointer transition-all ${
                      selectedInteraction?.id === interaction.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedInteraction(interaction)}
                    data-testid={`queue-item-${interaction.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">
                            {interaction.child.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {interaction.patient.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {interaction.urgencyLevel && (
                            <Badge 
                              className={`text-xs ${getUrgencyColor(interaction.urgencyLevel)}`}
                              data-testid={`urgency-${interaction.urgencyLevel}`}
                            >
                              {interaction.urgencyLevel}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-foreground line-clamp-2 mb-2">
                        {interaction.parentConcern}
                      </p>

                      {interaction.queuedAt && (
                        <div className={`flex items-center gap-1 text-xs ${getTimeInQueueColor(interaction)}`}>
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(interaction.queuedAt), { addSuffix: false })} in queue
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 overflow-auto">
          {selectedInteraction ? (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {/* Patient Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {selectedInteraction.child.name}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          DOB: {selectedInteraction.child.dateOfBirth}
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          MRN: {selectedInteraction.child.medicalRecordNumber}
                        </div>
                        {selectedInteraction.child.currentWeight && (
                          <div className="flex items-center gap-2">
                            <Weight className="w-4 h-4" />
                            Weight: {selectedInteraction.child.currentWeight} lbs
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        Parent: {selectedInteraction.patient.name}
                      </p>
                      <div className="space-y-1 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-2 justify-end">
                          <Phone className="w-4 h-4" />
                          <a 
                            href={`tel:${selectedInteraction.patient.phone}`} 
                            className="text-primary hover:underline"
                            data-testid="phone-link"
                          >
                            {selectedInteraction.patient.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Mail className="w-4 h-4" />
                          {selectedInteraction.patient.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Info Cards */}
              <div className="grid grid-cols-3 gap-4">
                {/* Medications */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {childMedicalData && childMedicalData.medications?.filter((m: any) => m.active).length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {childMedicalData.medications
                          .filter((m: any) => m.active)
                          .map((med: any) => (
                            <li key={med.id} className="text-foreground">
                              {med.name}
                              <span className="text-xs text-muted-foreground block">
                                {med.dosage} • {med.frequency}
                              </span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </CardContent>
                </Card>

                {/* Allergies */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {childMedicalData && childMedicalData.allergies && childMedicalData.allergies.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {childMedicalData.allergies.map((allergy: any) => (
                          <li key={allergy.id} className="text-foreground">
                            {allergy.allergen}
                            <span className="text-xs text-muted-foreground block">
                              {allergy.reaction}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">NKDA</p>
                    )}
                  </CardContent>
                </Card>

                {/* Problem List */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Problem List
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {childMedicalData && childMedicalData.problemList?.filter((p: any) => p.status === 'active').length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {childMedicalData.problemList
                          .filter((p: any) => p.status === 'active')
                          .map((problem: any) => (
                            <li key={problem.id} className="text-foreground">
                              {problem.condition}
                              {problem.icd10Code && (
                                <span className="text-xs text-muted-foreground font-mono block">
                                  ICD-10: {problem.icd10Code}
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">None</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Interaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Concern</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Parent's Concern</Label>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedInteraction.parentConcern}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Clara AI Assessment</Label>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      {selectedInteraction.aiSummary && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-foreground">Summary</p>
                          <p className="text-sm text-foreground mt-1">
                            {selectedInteraction.aiSummary}
                          </p>
                        </div>
                      )}
                      {selectedInteraction.claraRecommendations && (
                        <div>
                          <p className="text-sm font-medium text-foreground">Recommendations</p>
                          <p className="text-sm text-foreground mt-1">
                            {selectedInteraction.claraRecommendations}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Review Form */}
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-base">Provider Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="decision">Decision *</Label>
                      <Select 
                        value={reviewDecision} 
                        onValueChange={setReviewDecision}
                      >
                        <SelectTrigger id="decision" data-testid="select-decision">
                          <SelectValue placeholder="Select your decision" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agree" data-testid="option-agree">
                            Agree - AI response appropriate
                          </SelectItem>
                          <SelectItem value="agree_with_thoughts" data-testid="option-agree-with-thoughts">
                            Agree with additional thoughts
                          </SelectItem>
                          <SelectItem value="disagree" data-testid="option-disagree">
                            Disagree - Different approach needed
                          </SelectItem>
                          <SelectItem value="needs_escalation" data-testid="option-needs-escalation">
                            Needs escalation - Immediate attention
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="icd10">ICD-10 Code (Optional)</Label>
                      <Input
                        id="icd10"
                        value={icd10Code}
                        onChange={(e) => setIcd10Code(e.target.value)}
                        placeholder="e.g., J45.909"
                        className="font-mono"
                        data-testid="input-icd10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Provider Notes</Label>
                    <Textarea
                      id="notes"
                      value={providerNotes}
                      onChange={(e) => setProviderNotes(e.target.value)}
                      placeholder="Add any additional clinical notes or observations..."
                      className="min-h-[100px]"
                      data-testid="textarea-notes"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={!reviewDecision || submitReviewMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                      data-testid="button-submit-review"
                    >
                      {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    
                    {reviewDecision === 'needs_escalation' && (
                      <Button 
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10"
                        data-testid="button-start-escalation"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Text Conversation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ClipboardList className="w-12 h-12 text-muted-foreground mb-3 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Select an interaction from the queue to begin review
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
}