/**
 * Notifications Page
 *
 * Full page view of all notifications
 * Features:
 * - Paginated list
 * - Filter by read/unread
 * - Bulk actions (mark all as read, delete all)
 * - Individual notification actions
 *
 * @protected - Requires authentication (handled by middleware)
 */

"use client";

import { LoadingState, PageHeader } from "@/components/common";
import { useNotifications } from "@/components/providers/notification-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toRelativeTime } from "@/lib/date-utils";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  CheckCircle,
  Info,
  Trash2,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  // Extra protection: redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/notifications");
    }
  }, [status, router]);

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Bildirimler"
          description="Tüm bildirimleriniz"
          icon={<Bell className="h-6 w-6" />}
        />
        <LoadingState />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "info":
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const NotificationCard = ({
    notification,
  }: {
    notification: (typeof notifications)[0];
  }) => (
    <Card
      className={`p-4 transition-all hover:shadow-lg cursor-pointer ${
        !notification.read
          ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200"
          : ""
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">{getIcon(notification.type)}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {notification.title}
            </h3>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="text-slate-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-500">
              {toRelativeTime(notification.timestamp)}
            </span>
            {!notification.read && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(notification.id);
                }}
                className="text-xs"
              >
                Okundu işaretle
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screenbg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="Bildirimler"
          description={
            unreadCount > 0
              ? `${unreadCount} okunmamış bildirim`
              : "Tüm bildirimler okundu"
          }
          icon={<Bell className="h-6 w-6" />}
          action={
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Tümünü Okundu İşaretle
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={clearAll}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Tümünü Temizle
                </Button>
              )}
            </div>
          }
        />

        {/* Content */}
        {notifications.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Henüz bildirim yok
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Bildirimleriniz burada görünecek
              </p>
              <Link href="/dashboard">
                <Button>Dashboard'a Dön</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">
                Tümü ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Okunmamış ({unreadNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="read">
                Okunmuş ({readNotifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {unreadNotifications.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    Okunmamış bildirim yok
                  </p>
                </Card>
              ) : (
                unreadNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              {readNotifications.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-slate-600 dark:text-slate-400">
                    Okunmuş bildirim yok
                  </p>
                </Card>
              ) : (
                readNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
