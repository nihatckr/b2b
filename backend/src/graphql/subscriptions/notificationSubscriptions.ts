/**
 * Notification Subscriptions
 *
 * Real-time notification subscriptions for users
 */

import { requireAuth } from "../../utils/errors";
import { pubsub } from "../../utils/pubsub";
import { builder } from "../builder";

/**
 * Notification Type for Subscriptions
 */
const NotificationEvent = builder.objectRef<{
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  data?: any | null;
  orderId?: number | null;
  sampleId?: number | null;
  productionTrackingId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}>("NotificationEvent");

NotificationEvent.implement({
  fields: (t) => ({
    id: t.exposeInt("id"),
    userId: t.exposeInt("userId"),
    title: t.exposeString("title"),
    message: t.exposeString("message"),
    type: t.exposeString("type"),
    link: t.exposeString("link", { nullable: true }),
    isRead: t.exposeBoolean("isRead"),
    data: t.expose("data", { type: "JSON", nullable: true }),
    orderId: t.exposeInt("orderId", { nullable: true }),
    sampleId: t.exposeInt("sampleId", { nullable: true }),
    productionTrackingId: t.exposeInt("productionTrackingId", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

/**
 * Notification Read Event
 */
const NotificationReadEvent = builder.objectRef<{
  notificationId: number;
  isRead: boolean;
}>("NotificationReadEvent");

NotificationReadEvent.implement({
  fields: (t) => ({
    notificationId: t.exposeInt("notificationId"),
    isRead: t.exposeBoolean("isRead"),
  }),
});

/**
 * Subscription: newNotification
 *
 * Subscribe to new notifications for the authenticated user
 *
 * @example
 * ```graphql
 * subscription {
 *   newNotification {
 *     id
 *     title
 *     message
 *     type
 *     createdAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("newNotification", (t) =>
  t.field({
    type: NotificationEvent,
    authScopes: { user: true },
    description: "Subscribe to new notifications for the authenticated user",
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      console.log(`🔔 [newNotification] Subscription started for user ${context.user.id}`);

      // Subscribe to notification events for this specific user
      return pubsub.subscribe("notification:new", context.user.id);
    },
    resolve: (payload) => {
      console.log(`📤 [newNotification] Resolving payload:`, {
        id: payload.id,
        userId: payload.userId,
        title: payload.title,
        type: payload.type,
      });
      return payload;
    },
  })
);

/**
 * Subscription: notificationRead
 *
 * Subscribe to notification read status changes for the authenticated user
 *
 * @example
 * ```graphql
 * subscription {
 *   notificationRead {
 *     notificationId
 *     isRead
 *   }
 * }
 * ```
 */
builder.subscriptionField("notificationRead", (t) =>
  t.field({
    type: NotificationReadEvent,
    authScopes: { user: true },
    description: "Subscribe to notification read status changes",
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("notification:read", context.user.id);
    },
    resolve: (payload) => payload,
  })
);
