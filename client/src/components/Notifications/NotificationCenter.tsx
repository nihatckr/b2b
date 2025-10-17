"use client";

import {
    DELETE_NOTIFICATION_MUTATION,
    MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
    MARK_NOTIFICATION_AS_READ_MUTATION,
    MY_NOTIFICATIONS_QUERY,
} from "@/lib/graphql/notificationOperations";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "urql";
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
  id: number;
  title: string;
  message: string;
  type: "ORDER" | "SAMPLE" | "MESSAGE" | "PRODUCTION" | "QUALITY" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
  link?: string | null;
}

interface NotificationCenterProps {
  unreadCount?: number;
}

export function NotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [{ data, fetching, error }, refetchNotifications] = useQuery({
    query: MY_NOTIFICATIONS_QUERY,
    requestPolicy: "network-only", // Always fetch from network for fresh data
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications({ requestPolicy: "network-only" });
    }, 15000);
    return () => clearInterval(interval);
  }, [refetchNotifications]);

  const [, markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ_MUTATION);
  const [, markAllAsRead] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
  );
  const [, deleteNotification] = useMutation(DELETE_NOTIFICATION_MUTATION);

  const notifications: Notification[] = data?.myNotifications || [];
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead({ id });
    // Small delay to ensure database update is complete
    setTimeout(() => {
      refetchNotifications({ requestPolicy: "network-only" });
    }, 100);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead({});
    // Small delay to ensure database update is complete
    setTimeout(() => {
      refetchNotifications({ requestPolicy: "network-only" });
    }, 100);
  };

  const handleDelete = async (id: number) => {
    await deleteNotification({ id });
    // Small delay to ensure database update is complete
    setTimeout(() => {
      refetchNotifications({ requestPolicy: "network-only" });
    }, 100);
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "ORDER":
        return "���";
      case "SAMPLE":
        return "���";
      case "MESSAGE":
        return "���";
      case "PRODUCTION":
        return "���";
      case "QUALITY":
        return "✅";
      case "SYSTEM":
        return "⚙️";
      default:
        return "���";
    }
  };

  if (fetching && !data) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (error) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">Error loading notifications</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

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
                  className={`p-4 rounded-lg border transition-colors ${!notification.isRead ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
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
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        {notification.link && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={async () => {
                              // Mark as read when clicking View Details
                              if (!notification.isRead) {
                                await handleMarkAsRead(notification.id);
                              }
                              router.push(notification.link!);
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
