"use client";

import {
  NotificationOnNewNotificationDocument,
  NotificationOnTaskAssignedDocument,
} from "@/__generated__/graphql";
import { useSession } from "next-auth/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useSubscription } from "urql";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  expiresAt?: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/**
 * Optimized Notification Provider (2025)
 *
 * Features:
 * - GraphQL subscription integration
 * - Local state + localStorage persistence
 * - Auto-expiry (5 min for info, 10 min for error)
 * - Toast notifications (sonner)
 * - Hydration-safe (useEffect for localStorage)
 *
 * Benefits vs Old:
 * - No duplicate action serialization issues
 * - Direct GraphQL subscription → toast flow
 * - Simpler state management
 * - Better performance (no unnecessary re-renders)
 */
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Track processed notification IDs to prevent duplicates
  const processedNotificationIds = React.useRef<Set<string>>(new Set());

  // Session for authentication
  const { data: session } = useSession();

  // ============================================
  // LocalStorage Persistence
  // ============================================

  useEffect(() => {
    // Load from localStorage on mount (client-side only)
    try {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        const parsed: Notification[] = JSON.parse(stored).map(
          (n: {
            timestamp: string;
            expiresAt?: string;
            [key: string]: unknown;
          }) => ({
            ...n,
            timestamp: new Date(n.timestamp),
            expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
          })
        );
        setNotifications(parsed);
      }
    } catch (error) {
      console.warn("Failed to load notifications:", error);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Save to localStorage on change (skip initial render)
    if (!isHydrated) return;

    try {
      const serialized = notifications.map((n) => ({
        ...n,
        timestamp: n.timestamp.toISOString(),
        expiresAt: n.expiresAt?.toISOString(),
      }));
      localStorage.setItem("notifications", JSON.stringify(serialized));
    } catch (error) {
      console.warn("Failed to save notifications:", error);
    }
  }, [notifications, isHydrated]);

  // ============================================
  // Auto-Cleanup Expired Notifications
  // ============================================

  useEffect(() => {
    const cleanup = () => {
      const now = new Date();
      setNotifications((prev) =>
        prev.filter((n) => !n.expiresAt || n.expiresAt > now)
      );
    };

    cleanup(); // Initial cleanup
    const interval = setInterval(cleanup, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // ============================================
  // State Management Functions (define first!)
  // ============================================

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const now = new Date();
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: now,
        read: false,
        expiresAt: new Date(
          now.getTime() + (notification.type === "error" ? 10 : 5) * 60 * 1000
        ),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem("notifications");
    } catch (error) {
      console.warn("Failed to clear localStorage:", error);
    }
  }, []);

  // ============================================
  // GraphQL Subscriptions
  // ============================================

  // New Notification Subscription
  const [subscriptionResult] = useSubscription(
    { query: NotificationOnNewNotificationDocument },
    (prev, data) => {
      if (data.newNotification) {
        const notification = data.newNotification;

        // Check if we've already processed this notification
        const notificationId = notification.id?.toString();
        if (
          notificationId &&
          processedNotificationIds.current.has(notificationId)
        ) {
          console.log("⏭️ Skipping duplicate notification:", notificationId);
          return data;
        }

        // Mark as processed
        if (notificationId) {
          processedNotificationIds.current.add(notificationId);
        }

        // Map notification type to toast type
        const toastTypeMap: Record<
          string,
          "success" | "error" | "info" | "warning"
        > = {
          SYSTEM: "info",
          SUCCESS: "success",
          ERROR: "error",
          WARNING: "warning",
          INFO: "info",
        };

        const toastType = toastTypeMap[notification.type || "SYSTEM"] || "info";

        // Add to state (always)
        addNotification({
          type: toastType,
          title: notification.title || "Notification",
          message: notification.message || "",
        });

        // Show toast only for important notifications (error/warning)
        // For others, just update bell icon badge silently
        if (toastType === "error") {
          toast.error(notification.title || "Notification", {
            description: notification.message || "",
            duration: 5000,
          });
        } else if (toastType === "warning") {
          toast.warning(notification.title || "Notification", {
            description: notification.message || "",
            duration: 4000,
          });
        }
        // Success and info notifications only show in bell icon
      }
      return data;
    }
  );

  // Task Assigned Subscription
  useSubscription(
    { query: NotificationOnTaskAssignedDocument },
    (prev, data) => {
      if (data.taskAssigned) {
        const task = data.taskAssigned;

        addNotification({
          type: "info",
          title: "Yeni Görev Atandı",
          message: `${task.title} - ${task.description}`,
        });

        toast.info("Yeni Görev", {
          description: task.title,
        });
      }
      return data;
    }
  );

  // ============================================
  // Computed Values
  // ============================================

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
