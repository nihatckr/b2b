"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthProvider";
import {
  MARK_MESSAGE_READ_MUTATION,
  MY_MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
} from "@/lib/graphql/message-operations";
import { IconClipboard, IconMail, IconPackage, IconSend } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "urql";

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number | null;
  isRead: boolean;
  type: string;
  orderId?: number | null;
  sampleId?: number | null;
  createdAt: string;
  sender: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    company?: {
      id: number;
      name: string;
    } | null;
  };
  receiver?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  } | null;
  order?: {
    id: number;
    orderNumber: string;
    collection?: {
      id: number;
      name: string;
    };
  } | null;
  sample?: {
    id: number;
    sampleNumber: string;
    name?: string | null;
  } | null;
}

interface Conversation {
  key: string;
  type: "order" | "sample" | "direct";
  orderId?: number;
  sampleId?: number;
  order?: Message["order"];
  sample?: Message["sample"];
  otherUser?: Message["sender"];
  messages: Message[];
  unreadCount: number;
  lastMessage: Message;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [{ data, fetching }, refetchMessages] = useQuery({
    query: MY_MESSAGES_QUERY,
    variables: {
      filter:
        activeTab === "unread"
          ? { unreadOnly: true }
          : activeTab === "order"
            ? { type: "order" }
            : activeTab === "sample"
              ? { type: "sample" }
              : {},
    },
    requestPolicy: "network-only",
  });

  const [, sendMessage] = useMutation(SEND_MESSAGE_MUTATION);
  const [, markAsRead] = useMutation(MARK_MESSAGE_READ_MUTATION);

  const messages: Message[] = data?.myMessages || [];

  // Calculate unread count from messages
  const unreadCount = messages.filter(
    (msg) => !msg.isRead && msg.receiverId === user?.id
  ).length;

  const conversations: Conversation[] = messages.reduce((acc: Conversation[], msg: Message) => {
    let key: string;
    if (msg.orderId) {
      key = `order-${msg.orderId}`;
    } else if (msg.sampleId) {
      key = `sample-${msg.sampleId}`;
    } else {
      const otherUserId =
        msg.senderId === user?.id ? msg.receiver?.id : msg.sender.id;
      key = `user-${otherUserId}`;
    }

    const existing = acc.find((c) => c.key === key);
    if (existing) {
      existing.messages.push(msg);
      if (!msg.isRead && msg.receiverId === user?.id) {
        existing.unreadCount++;
      }
      if (new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
        existing.lastMessage = msg;
      }
    } else {
      acc.push({
        key,
        type: msg.orderId ? "order" : msg.sampleId ? "sample" : "direct",
        orderId: msg.orderId || undefined,
        sampleId: msg.sampleId || undefined,
        order: msg.order || undefined,
        sample: msg.sample || undefined,
        otherUser: msg.senderId === user?.id ? msg.receiver || undefined : msg.sender,
        messages: [msg],
        unreadCount: !msg.isRead && msg.receiverId === user?.id ? 1 : 0,
        lastMessage: msg,
      });
    }
    return acc;
  }, []);

  conversations.sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt).getTime() -
      new Date(a.lastMessage.createdAt).getTime()
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation?.messages.length]);

  // Update selected conversation when conversations change
  useEffect(() => {
    if (selectedConversation) {
      const updatedConversation = conversations.find(c => c.key === selectedConversation.key);
      if (updatedConversation && updatedConversation.messages.length !== selectedConversation.messages.length) {
        setSelectedConversation(updatedConversation);
      }
    }
  }, [conversations]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const unreadMessages = conversation.messages.filter(
      (m) => !m.isRead && m.receiverId === user?.id
    );
    for (const msg of unreadMessages) {
      await markAsRead({ id: msg.id });
    }
    refetchMessages({ requestPolicy: "network-only" });
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation || !user || isSending) return;

    setIsSending(true);

    const input: any = {
      content: messageContent,
      type: selectedConversation.type,
    };

    if (selectedConversation.orderId) {
      input.orderId = selectedConversation.orderId;
      const firstMessage = selectedConversation.messages[0];
      const otherUserId = firstMessage.senderId === user.id ? firstMessage.receiverId : firstMessage.senderId;
      input.receiverId = otherUserId;
    } else if (selectedConversation.sampleId) {
      input.sampleId = selectedConversation.sampleId;
      const firstMessage = selectedConversation.messages[0];
      const otherUserId = firstMessage.senderId === user.id ? firstMessage.receiverId : firstMessage.senderId;
      input.receiverId = otherUserId;
    } else {
      input.receiverId = selectedConversation.otherUser?.id;
    }

    const result = await sendMessage({ input });

    if (!result.error) {
      setMessageContent("");
      // Force refetch to get the new message
      refetchMessages({ requestPolicy: "network-only" });
    }

    setIsSending(false);
  };  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === "order") {
      return `Sipariş: ${conversation.order?.orderNumber || ""}`;
    } else if (conversation.type === "sample") {
      return `Numune: ${conversation.sample?.sampleNumber || conversation.sample?.name || ""}`;
    } else {
      return `${conversation.otherUser?.firstName || ""} ${conversation.otherUser?.lastName || ""}`.trim() || "Kullanıcı";
    }
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.type === "order") {
      return conversation.order?.collection?.name || "";
    } else if (conversation.type === "sample") {
      return conversation.sample?.name || "";
    } else {
      return conversation.otherUser?.company?.name || "";
    }
  };

  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mesajlar</h1>
        <p className="text-muted-foreground">Ürün bazlı mesajlaşma - Siparişler ve Numuneler</p>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Konuşma</CardTitle>
            <IconMail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Okunmamış</CardTitle>
            <IconMail className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Mesaj</CardTitle>
            <IconSend className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="order">
            <IconPackage className="mr-2 h-4 w-4" />
            Siparişler
          </TabsTrigger>
          <TabsTrigger value="sample">
            <IconClipboard className="mr-2 h-4 w-4" />
            Numuneler
          </TabsTrigger>
          <TabsTrigger value="unread">
            Okunmamış{unreadCount > 0 && (<Badge className="ml-2" variant="destructive">{unreadCount}</Badge>)}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-4">
              <CardHeader><CardTitle>Konuşmalar</CardTitle></CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {fetching ? (
                    <div className="p-4 text-center">Yükleniyor...</div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Mesaj bulunamadı</div>
                  ) : (
                    conversations.map((conversation) => (
                      <div key={conversation.key} className={`cursor-pointer border-b p-4 transition-colors hover:bg-accent ${selectedConversation?.key === conversation.key ? "bg-accent" : ""}`} onClick={() => handleSelectConversation(conversation)}>
                        <div className="flex items-start gap-3">
                          <Avatar><AvatarFallback>{conversation.type === "order" ? "S" : conversation.type === "sample" ? "N" : conversation.otherUser?.firstName?.[0] || "U"}</AvatarFallback></Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <h3 className="truncate font-medium">{getConversationTitle(conversation)}</h3>
                              {conversation.unreadCount > 0 && (<span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs">{conversation.unreadCount}</span>)}
                            </div>
                            <p className="text-muted-foreground truncate text-sm">{getConversationSubtitle(conversation)}</p>
                            <p className="text-muted-foreground truncate text-xs">{conversation.lastMessage.content}</p>
                            <p className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true, locale: tr })}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            <Card className="col-span-8">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b">
                    <CardTitle>{getConversationTitle(selectedConversation)}</CardTitle>
                    <p className="text-muted-foreground text-sm">{getConversationSubtitle(selectedConversation)}</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[500px] overflow-y-auto p-4">
                      <div className="space-y-4">
                        {selectedConversation.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg) => {
                          const isMe = msg.senderId === user.id;
                          return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                {!isMe && <p className="mb-1 text-xs font-medium">{msg.sender.firstName} {msg.sender.lastName}</p>}
                                <p className="text-sm">{msg.content}</p>
                                <p className={`mt-1 text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: tr })}</p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Mesajınızı yazın..."
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          disabled={isSending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={isSending || !messageContent.trim()}
                        >
                          <IconSend className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex h-[600px] items-center justify-center">
                  <p className="text-muted-foreground">Bir konuşma seçin</p>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
