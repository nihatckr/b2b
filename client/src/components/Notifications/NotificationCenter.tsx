"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "sample" | "message" | "production" | "system";
  isRead: boolean;
  timestamp: string;
  link?: string;
}

interface NotificationCenterProps {
  unreadCount?: number;
}

export function NotificationCenter({
  unreadCount = 0,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Order Received",
      message: "Order #ORD-2025-001 has been placed",
      type: "order",
      isRead: false,
      timestamp: new Date().toISOString(),
      link: "/dashboard/orders/1",
    },
    {
      id: "2",
      title: "Sample Status Updated",
      message: "SMP-2025-001 is now IN_PRODUCTION",
      type: "sample",
      isRead: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      link: "/dashboard/samples/1",
    },
    {
      id: "3",
      title: "New Message",
      message: "You have a new message from Ahmet Yılmaz",
      type: "message",
      isRead: true,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      link: "/dashboard/messages",
    },
  ]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "📦";
      case "sample":
        return "🎨";
      case "message":
        return "💬";
      case "production":
        return "🏭";
      case "system":
        return "⚙️";
      default:
        return "📌";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
              variant="destructive"
            >
              {unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all as read
              </Button>
            )}
          </div>
          <SheetDescription>
            You have {unreadNotifications.length} unread notification
            {unreadNotifications.length !== 1 ? "s" : ""}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm mt-2">
                You'll be notified about important updates here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    !notification.isRead
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                        })}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {notification.link && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => {
                              window.location.href = notification.link!;
                              setIsOpen(false);
                            }}
                          >
                            View Details
                          </Button>
                        )}
                        {!notification.isRead && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs text-red-600"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
