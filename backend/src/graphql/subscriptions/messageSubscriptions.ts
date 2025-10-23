/**
 * Message Subscriptions
 *
 * Real-time subscriptions for messaging system
 */

import { requireAuth } from "../../utils/errors";
import { pubsub } from "../../utils/pubsub";
import { builder } from "../builder";

/**
 * Message Event
 */
const MessageEvent = builder.objectRef<{
  id: number;
  content: string;
  productId: number;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  createdAt: Date;
}>("MessageEvent");

MessageEvent.implement({
  fields: (t) => ({
    id: t.exposeInt("id"),
    content: t.exposeString("content"),
    productId: t.exposeInt("productId"),
    senderId: t.exposeInt("senderId"),
    receiverId: t.exposeInt("receiverId"),
    isRead: t.exposeBoolean("isRead"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
  }),
});

/**
 * Message Read Event
 */
const MessageReadEvent = builder.objectRef<{
  messageId: number;
  isRead: boolean;
  readAt: Date;
}>("MessageReadEvent");

MessageReadEvent.implement({
  fields: (t) => ({
    messageId: t.exposeInt("messageId"),
    isRead: t.exposeBoolean("isRead"),
    readAt: t.expose("readAt", { type: "DateTime" }),
  }),
});

/**
 * Subscription: newMessage
 *
 * Subscribe to new messages for a specific product/conversation
 *
 * @example
 * ```graphql
 * subscription {
 *   newMessage(productId: 123) {
 *     id
 *     content
 *     senderId
 *     createdAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("newMessage", (t) =>
  t.field({
    type: MessageEvent,
    authScopes: { user: true },
    description: "Subscribe to new messages for a specific product conversation",
    args: {
      productId: t.arg.int({ required: true, description: "Product ID (Collection/Sample/Order)" }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("message:new", args.productId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: messageRead
 *
 * Subscribe to message read status changes
 *
 * @example
 * ```graphql
 * subscription {
 *   messageRead(productId: 123) {
 *     messageId
 *     isRead
 *     readAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("messageRead", (t) =>
  t.field({
    type: MessageReadEvent,
    authScopes: { user: true },
    description: "Subscribe to message read status changes",
    args: {
      productId: t.arg.int({ required: true, description: "Product ID to watch" }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("message:read", args.productId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: myMessages
 *
 * Subscribe to all messages sent to the authenticated user
 *
 * @example
 * ```graphql
 * subscription {
 *   myMessages {
 *     id
 *     content
 *     productId
 *     senderId
 *     createdAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("myMessages", (t) =>
  t.field({
    type: MessageEvent,
    authScopes: { user: true },
    description: "Subscribe to all messages sent to the authenticated user",
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      // Subscribe to user-specific messages channel
      return pubsub.subscribe("message:userReceived", context.user.id);
    },
    resolve: (payload) => payload,
  })
);
