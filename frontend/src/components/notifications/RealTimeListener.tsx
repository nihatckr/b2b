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

'use client';

import { useSubscription } from '@/hooks/useGraphQL';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { gql } from 'urql';

// ============================================
// GraphQL Subscription
// ============================================

const NEW_NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNewNotification {
    newNotification {
      id
      title
      message
      type
      isRead
      relatedEntityType
      relatedEntityId
      actionUrl
      createdAt
    }
  }
`;

// ============================================
// Component
// ============================================

export function NotificationListener() {
  const [result] = useSubscription({
    query: NEW_NOTIFICATION_SUBSCRIPTION,
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
              label: 'Git',
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
    if (process.env.NODE_ENV === 'development') {
      if (result.fetching) {
        console.log('🔌 WebSocket connecting...');
      }
      if (result.error) {
        console.error('❌ WebSocket error:', result.error.message);
      }
      if (result.data) {
        console.log('✅ New notification received:', result.data.newNotification);
      }
    }
  }, [result.fetching, result.error, result.data]);

  // Bu component UI render etmez (background listener)
  return null;
}

// ============================================
// Order Updates Listener
// ============================================

const MY_ORDER_UPDATES_SUBSCRIPTION = gql`
  subscription OnMyOrderUpdates {
    myOrderUpdates {
      orderId
      orderNumber
      status
      previousStatus
      updatedAt
    }
  }
`;

export function OrderUpdatesListener() {
  const [result] = useSubscription({
    query: MY_ORDER_UPDATES_SUBSCRIPTION,
  });

  useEffect(() => {
    if (result.data?.myOrderUpdates) {
      const update = result.data.myOrderUpdates;

      toast.success(`Sipariş Güncellendi`, {
        description: `${update.orderNumber || `#${update.orderId}`} - Durum: ${update.status}`,
        duration: 5000,
      });
    }
  }, [result.data]);

  return null;
}

// ============================================
// Task Updates Listener
// ============================================

const TASK_ASSIGNED_SUBSCRIPTION = gql`
  subscription OnTaskAssigned {
    taskAssigned {
      id
      title
      description
      priority
      dueDate
      createdAt
    }
  }
`;

export function TaskAssignedListener() {
  const [result] = useSubscription({
    query: TASK_ASSIGNED_SUBSCRIPTION,
  });

  useEffect(() => {
    if (result.data?.taskAssigned) {
      const task = result.data.taskAssigned;

      toast.info('Yeni Görev Atandı', {
        description: task.title,
        duration: 5000,
        action: {
          label: 'Görüntüle',
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
      <OrderUpdatesListener />
      <TaskAssignedListener />
    </>
  );
}
