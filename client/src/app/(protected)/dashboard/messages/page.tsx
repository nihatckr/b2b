"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import {
  DELETE_MESSAGE_MUTATION,
  MARK_MESSAGE_READ_MUTATION,
  MY_MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
  UNREAD_COUNT_QUERY,
} from "@/lib/graphql/message-operations";
import { showToast } from "@/lib/toast";
import { Building2, Mail, MailOpen, Send, Trash2, User } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "urql";

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiver?: string | null;
  isRead: boolean;
  type: string;
  createdAt: string;
  sender: {
    id: number;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    company?: {
      id: number;
      name: string;
    } | null;
  };
  company?: {
    id: number;
    name: string;
  } | null;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Queries
  const [{ data, fetching }, reexecuteQuery] = useQuery({
    query: MY_MESSAGES_QUERY,
    variables: {
      filter: filter === "unread" ? { unreadOnly: true } : {},
    },
    requestPolicy: "cache-and-network",
  });

  const [{ data: unreadData }] = useQuery({
    query: UNREAD_COUNT_QUERY,
    requestPolicy: "cache-and-network",
  });

  // Mutations
  const [, sendMessage] = useMutation(SEND_MESSAGE_MUTATION);
  const [, markAsRead] = useMutation(MARK_MESSAGE_READ_MUTATION);
  const [, deleteMessage] = useMutation(DELETE_MESSAGE_MUTATION);

  // Compose form
  const [composeForm, setComposeForm] = useState({
    receiver: "",
    content: "",
    type: "direct",
  });

  const messages = (data?.myMessages || []) as Message[];
  const unreadCount = unreadData?.unreadMessageCount || 0;

  const handleSendMessage = async () => {
    if (!composeForm.content.trim()) {
      showToast("Mesaj içeriği gerekli", "error");
      return;
    }

    const result = await sendMessage({
      input: {
        content: composeForm.content.trim(),
        receiver: composeForm.receiver || null,
        type: composeForm.type,
      },
    });

    if (result.error) {
      showToast(result.error.message, "error");
      return;
    }

    showToast("Mesaj gönderildi! 📨", "success");
    setComposeForm({ receiver: "", content: "", type: "direct" });
    setIsComposeOpen(false);
    reexecuteQuery({ requestPolicy: "network-only" });
  };

  const handleMarkAsRead = async (messageId: number) => {
    const result = await markAsRead({ id: messageId });

    if (!result.error) {
      reexecuteQuery({ requestPolicy: "network-only" });
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    const result = await deleteMessage({ id: messageId });

    if (result.error) {
      showToast(result.error.message, "error");
      return;
    }

    showToast("Mesaj silindi", "success");
    reexecuteQuery({ requestPolicy: "network-only" });
  };

  const getSenderName = (message: Message) => {
    if (message.sender.firstName && message.sender.lastName) {
      return `${message.sender.firstName} ${message.sender.lastName}`;
    }
    return message.sender.name || message.sender.email;
  };

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case "direct":
        return <Badge variant="outline">👤 Direkt</Badge>;
      case "company":
        return <Badge className="bg-blue-500">🏢 Firma</Badge>;
      case "system":
        return <Badge className="bg-purple-500">⚙️ Sistem</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mesajlar</h1>
          <p className="text-muted-foreground">Firmalar arası ve iç iletişim</p>
        </div>

        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Yeni Mesaj
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Mesaj Gönder</DialogTitle>
              <DialogDescription>
                Kullanıcılara veya firmalara mesaj gönderin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="receiver">Alıcı (Opsiyonel)</Label>
                <Input
                  id="receiver"
                  placeholder="User ID veya 'all' (firma geneli)"
                  value={composeForm.receiver}
                  onChange={(e) =>
                    setComposeForm((prev) => ({
                      ...prev,
                      receiver: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Mesaj</Label>
                <Textarea
                  id="content"
                  placeholder="Mesajınızı yazın..."
                  rows={5}
                  value={composeForm.content}
                  onChange={(e) =>
                    setComposeForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="mr-2 h-4 w-4" />
                Gönder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Mesaj</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Okunmamış</CardTitle>
            <MailOpen className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gönderilen</CardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter((m) => m.senderId === user.id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Tümü ({messages.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
        >
          Okunmamış ({unreadCount})
        </Button>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Mesajlar</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching && <p>Yükleniyor...</p>}

          {!fetching && messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Henüz mesaj yok</p>
              <p className="text-sm">
                "Yeni Mesaj" butonuna tıklayarak mesaj gönderebilirsiniz
              </p>
            </div>
          )}

          {!fetching && messages.length > 0 && (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    !message.isRead
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold">
                          {message.senderId === user.id ? (
                            <span className="text-muted-foreground">
                              Siz → {message.receiver || "Herkese"}
                            </span>
                          ) : (
                            <>
                              <User className="inline h-4 w-4 mr-1" />
                              {getSenderName(message)}
                            </>
                          )}
                        </div>
                        {message.sender.company && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {message.sender.company.name}
                          </div>
                        )}
                        {getMessageTypeBadge(message.type)}
                        {!message.isRead && message.senderId !== user.id && (
                          <Badge className="bg-yellow-500">Yeni</Badge>
                        )}
                      </div>

                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>

                      <div className="mt-2 text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString("tr-TR")}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {!message.isRead && message.senderId !== user.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(message.id)}
                        >
                          <MailOpen className="h-4 w-4" />
                        </Button>
                      )}
                      {(message.senderId === user.id ||
                        user.role === "ADMIN") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
