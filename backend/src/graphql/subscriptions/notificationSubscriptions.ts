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
  isRead: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  actionUrl?: string | null;
  createdAt: Date;
}>("NotificationEvent");

NotificationEvent.implement({
  fields: (t) => ({
    id: t.exposeInt("id"),
    userId: t.exposeInt("userId"),
    title: t.exposeString("title"),
    message: t.exposeString("message"),
    type: t.exposeString("type"),
    isRead: t.exposeBoolean("isRead"),
    relatedEntityType: t.exposeString("relatedEntityType", { nullable: true }),
    relatedEntityId: t.exposeInt("relatedEntityId", { nullable: true }),
    actionUrl: t.exposeString("actionUrl", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
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

      // Subscribe to notification events for this specific user
      return pubsub.subscribe("notification:new", context.user.id);
    },
    resolve: (payload) => payload,
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
