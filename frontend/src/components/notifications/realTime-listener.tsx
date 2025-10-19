/**
 * Real-Time Notification Listener Component
 *
 * WebSocket subscription kullanarak backend'den gelen bildirimleri dinler.
 * Backend GraphQL Yoga subscription sistemi ile tam entegre.
 *
 * Kullanım:
 * - Layout'a ekleyin (app/layout.tsx)
 * - Arka planda çalışır, bildirimleri toast ile gösterir
 */

"use client";

import {
  OnNewNotificationDocument,
  OnTaskAssignedDocument,
} from "@/__generated__/graphql";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSubscription } from "urql";

// ============================================
// Component
// ============================================

export function NotificationListener() {
  const [result] = useSubscription({
    query: OnNewNotificationDocument,
    pause: false, // Her zaman aktif
  });

  // Yeni bildirim geldiğinde toast göster
  useEffect(() => {
    if (result.data?.newNotification) {
      const notification = result.data.newNotification;

      toast(notification.title, {
        description: notification.message,
        duration: 5000,
        action: notification.actionUrl
          ? {
              label: "Git",
              onClick: () => {
                window.location.href = notification.actionUrl!;
              },
            }
          : undefined,
      });
    }
  }, [result.data]);

  // Debug (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (result.fetching) {
        console.log("🔌 WebSocket connecting...");
      }
      if (result.error) {
        console.error("❌ WebSocket error:", result.error.message);
      }
      if (result.data) {
        console.log(
          "✅ New notification received:",
          result.data.newNotification
        );
      }
    }
  }, [result.fetching, result.error, result.data]);

  // Bu component UI render etmez (background listener)
  return null;
}

// ============================================
// Task Updates Listener
// ============================================

export function TaskAssignedListener() {
  const [result] = useSubscription({
    query: OnTaskAssignedDocument,
  });

  useEffect(() => {
    if (result.data?.taskAssigned) {
      const task = result.data.taskAssigned;

      toast.info("Yeni Görev Atandı", {
        description: task.title,
        duration: 5000,
        action: {
          label: "Görüntüle",
          onClick: () => {
            window.location.href = `/tasks/${task.id}`;
          },
        },
      });
    }
  }, [result.data]);

  return null;
}

// ============================================
// Combined Listener (Tüm subscriptions tek component'te)
// ============================================

export function RealTimeListener() {
  return (
    <>
      <NotificationListener />
      <TaskAssignedListener />
    </>
  );
}
