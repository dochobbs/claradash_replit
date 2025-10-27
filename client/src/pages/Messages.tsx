import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Phone, MessageSquare, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  patientName: string;
  childName: string;
  phoneNumber: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  urgent: boolean;
}

// Sample messages data
const sampleMessages: Message[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    childName: "Emma Johnson",
    phoneNumber: "415-555-0123",
    lastMessage: "Thank you for the clarification on the dosage. Emma is feeling better.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unread: true,
    urgent: false,
  },
  {
    id: "2",
    patientName: "Michael Chen",
    childName: "Lucas Chen",
    phoneNumber: "650-555-0456",
    lastMessage: "The fever hasn't gone down. Should we come in?",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    unread: true,
    urgent: true,
  },
  {
    id: "3",
    patientName: "Emily Davis",
    childName: "Sophia Davis",
    phoneNumber: "510-555-0789",
    lastMessage: "Understood, we'll continue with the current treatment plan.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unread: false,
    urgent: false,
  },
];

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const filteredMessages = sampleMessages.filter(
    msg => 
      msg.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.phoneNumber.includes(searchQuery)
  );

  const unreadMessages = filteredMessages.filter(m => m.unread);
  const allMessages = filteredMessages;

  return (
    <Layout>
      <div className="flex h-full">
        {/* Messages List */}
        <div className="w-96 border-r bg-card">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-messages"
              />
            </div>
          </div>

          <Tabs defaultValue="unread" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1">
              <TabsTrigger value="unread" data-testid="tab-unread">
                Unread ({unreadMessages.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({allMessages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="m-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {unreadMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                    <p>No unread messages</p>
                  </div>
                ) : (
                  unreadMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 border-b hover:bg-accent cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-accent' : ''
                      }`}
                      data-testid={`message-item-${message.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{message.childName}</p>
                            <p className="text-xs text-muted-foreground">{message.patientName}</p>
                          </div>
                        </div>
                        {message.urgent && (
                          <Badge className="bg-coral text-white">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                        {message.lastMessage}
                      </p>
                      <div className="flex items-center justify-between">
                        <a 
                          href={`tel:${message.phoneNumber}`} 
                          className="text-xs text-primary hover:underline font-mono"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`phone-${message.id}`}
                        >
                          {message.phoneNumber}
                        </a>
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {allMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b hover:bg-accent cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-accent' : ''
                    }`}
                    data-testid={`message-item-all-${message.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {message.patientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{message.childName}</p>
                          <p className="text-xs text-muted-foreground">{message.patientName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {message.urgent && (
                          <Badge className="bg-coral text-white">Urgent</Badge>
                        )}
                        {message.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                      {message.lastMessage}
                    </p>
                    <div className="flex items-center justify-between">
                      <a 
                        href={`tel:${message.phoneNumber}`} 
                        className="text-xs text-primary hover:underline font-mono"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`phone-all-${message.id}`}
                      >
                        {message.phoneNumber}
                      </a>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Message Detail/Conversation */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedMessage.childName}</h2>
                    <p className="text-sm text-muted-foreground">
                      Parent: {selectedMessage.patientName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" data-testid="button-call">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href={`tel:${selectedMessage.phoneNumber}`} className="font-mono">
                        {selectedMessage.phoneNumber}
                      </a>
                    </Button>
                    {selectedMessage.urgent && (
                      <Badge className="bg-coral text-white">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Sample conversation */}
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-md">
                      <p className="text-sm">{selectedMessage.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {formatDistanceToNow(selectedMessage.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <p className="text-xs text-muted-foreground">
                      <Clock className="inline w-3 h-3 mr-1" />
                      Conversation started {formatDistanceToNow(selectedMessage.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1"
                    data-testid="input-message"
                  />
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Select a message to view conversation</p>
              <p className="text-sm mt-2">Choose from unread or all messages</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}