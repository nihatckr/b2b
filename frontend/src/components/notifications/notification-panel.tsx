/**
 * Notification Panel Component
 *
 * Dropdown panel showing all notifications
 * Features:
 * - List of notifications with read/unread status
 * - Mark as read on click
 * - Mark all as read button
 * - Clear all button
 * - Link to notification center
 *
 * Usage:
 * - Opens from NotificationBell
 * - Shows recent notifications (max 10)
 */

"use client";

import { useNotifications } from "@/components/providers/notification-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle,
  Info,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  // Show only last 10 notifications
  const recentNotifications = notifications.slice(0, 10);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        );
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "warning":
        return (
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        );
      case "info":
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      window.location.href = link;
      onClose?.();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Bildirimler</h2>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-2"
              title="Tümünü okundu işaretle"
            >
              <CheckCheck className="w-4 h-4" />
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-8 px-2 hover:text-destructive"
              title="Tümünü temizle"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="flex-1 max-h-[400px]">
        {recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Henüz bildirim yok</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors cursor-pointer hover:bg-accent ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="h-6 px-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3">
            <Link href="/dashboard/notifications" onClick={onClose}>
              <Button variant="ghost" className="w-full">
                Tüm Bildirimleri Gör
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
