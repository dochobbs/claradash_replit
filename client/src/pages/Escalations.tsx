import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { 
  MessageSquare, Send, AlertCircle, Clock, User, 
  CheckCircle, XCircle, AlertTriangle
} from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

// Extended type for escalation with full interaction details
interface EscalationWithFullDetails {
  id: string;
  interactionId: string;
  initiatedBy: string;
  status: string | null;
  severity: string | null;
  reason: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  messages: Message[];
  interaction: {
    id: string;
    parentConcern: string;
    child: {
      id: string;
      name: string;
    };
    patient: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

// Provider ID for demo
const PROVIDER_ID = "provider-1";

export default function Escalations() {
  const { toast } = useToast();
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationWithFullDetails | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const { data: escalations, isLoading } = useQuery<EscalationWithFullDetails[]>({
    queryKey: ["/api/escalations"],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { escalationId: string; content: string }) => {
      return await apiRequest("POST", "/api/messages", {
        escalationId: data.escalationId,
        senderId: PROVIDER_ID,
        senderType: "provider",
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/escalations"] });
      setMessageContent("");
      setSendingMessage(false);
      toast({
        title: "Message sent",
        description: "Your message has been delivered to the parent.",
      });
    },
    onError: () => {
      setSendingMessage(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resolveEscalationMutation = useMutation({
    mutationFn: async (escalationId: string) => {
      return await apiRequest("PATCH", `/api/escalations/${escalationId}`, {
        status: "resolved",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/escalations"] });
      setSelectedEscalation(null);
      toast({
        title: "Escalation resolved",
        description: "The escalation has been marked as resolved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve escalation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!selectedEscalation || !messageContent.trim()) return;
    
    setSendingMessage(true);
    sendMessageMutation.mutate({
      escalationId: selectedEscalation.id,
      content: messageContent.trim(),
    });
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge>Unknown</Badge>;
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500 text-white">Pending</Badge>;
      case 'texting':
        return <Badge className="bg-blue-500 text-white">Active</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string | null | undefined) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'moderate':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const activeEscalations = escalations?.filter(e => e.status !== 'resolved') || [];
  const resolvedEscalations = escalations?.filter(e => e.status === 'resolved') || [];

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Escalation List */}
        <div className="w-96 border-r border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Escalations</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeEscalations.length} active • {resolvedEscalations.length} resolved
            </p>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-3">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              ) : (
                <>
                  {/* Active Escalations */}
                  {activeEscalations.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase text-muted-foreground font-medium">Active</p>
                      {activeEscalations.map((escalation) => (
                        <Card
                          key={escalation.id}
                          className={`cursor-pointer transition-all ${
                            selectedEscalation?.id === escalation.id
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedEscalation(escalation)}
                          data-testid={`escalation-${escalation.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-foreground">
                                  {escalation.interaction.child.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {escalation.interaction.patient.name}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(escalation.severity)}
                                {getStatusBadge(escalation.status)}
                              </div>
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">
                              {escalation.reason || escalation.interaction.parentConcern}
                            </p>
                            {escalation.messages.length > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare className="w-3 h-3" />
                                <span>{escalation.messages.length} messages</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Resolved Escalations */}
                  {resolvedEscalations.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <p className="text-xs uppercase text-muted-foreground font-medium">Resolved</p>
                      {resolvedEscalations.map((escalation) => (
                        <Card
                          key={escalation.id}
                          className={`cursor-pointer transition-all opacity-60 ${
                            selectedEscalation?.id === escalation.id
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedEscalation(escalation)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-foreground">
                                  {escalation.interaction.child.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {escalation.interaction.patient.name}
                                </div>
                              </div>
                              {getStatusBadge(escalation.status)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {escalation.reason || escalation.interaction.parentConcern}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {escalations?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">No escalations</p>
                      <p className="text-xs text-muted-foreground">
                        Escalations will appear here when needed
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Message Thread */}
        <div className="flex-1 flex flex-col">
          {selectedEscalation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border bg-background">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedEscalation.interaction.child.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Parent: {selectedEscalation.interaction.patient.name} • 
                      <a 
                        href={`tel:${selectedEscalation.interaction.patient.phone}`} 
                        className="text-primary hover:underline"
                        data-testid="phone-link"
                      >
                        {selectedEscalation.interaction.patient.phone}
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedEscalation.status)}
                    {selectedEscalation.status !== 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveEscalationMutation.mutate(selectedEscalation.id)}
                        data-testid="button-resolve"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Original Concern */}
                <Card className="mt-3 bg-muted/50">
                  <CardContent className="p-3">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Original Concern</p>
                    <p className="text-sm text-foreground">
                      {selectedEscalation.interaction.parentConcern}
                    </p>
                    {selectedEscalation.reason && (
                      <>
                        <Separator className="my-2" />
                        <p className="text-xs uppercase text-muted-foreground mb-1">Escalation Reason</p>
                        <p className="text-sm text-foreground">
                          {selectedEscalation.reason}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedEscalation.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground">
                        Start the conversation below
                      </p>
                    </div>
                  ) : (
                    selectedEscalation.messages.map((message: Message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderType === 'provider' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderType === 'provider'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              {message.senderType === 'provider' ? 'You' : 'Parent'}
                            </span>
                            <span className="text-xs opacity-70">
                              {format(new Date(message.createdAt), 'h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              {selectedEscalation.status !== 'resolved' && (
                <div className="p-4 border-t border-border bg-background">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message to the parent..."
                      className="min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSendMessage();
                        }
                      }}
                      data-testid="textarea-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendingMessage}
                      className="self-end"
                      data-testid="button-send"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Ctrl+Enter to send
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-3 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Select an escalation to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}