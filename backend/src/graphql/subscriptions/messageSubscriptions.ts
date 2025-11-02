/**
 * Message Subscriptions
 *
 * Real-time subscriptions for messaging system
 */

import { requireAuth } from "../../utils/errors";
import { pubsub } from "../../utils/pubsub";
import builder from "../builder";

/**
 * Message Event
 */
const MessageEvent = builder.objectRef<{
  id: number;
  content: string;
  type: string;
  orderId: number | null;
  sampleId: number | null;
  senderId: number;
  receiverId: number | null;
  isRead: boolean;
  createdAt: Date;
}>("MessageEvent");

MessageEvent.implement({
  fields: (t) => ({
    id: t.exposeInt("id"),
    content: t.exposeString("content"),
    type: t.exposeString("type"),
    orderId: t.exposeInt("orderId", { nullable: true }),
    sampleId: t.exposeInt("sampleId", { nullable: true }),
    senderId: t.exposeInt("senderId"),
    receiverId: t.exposeInt("receiverId", { nullable: true }),
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
 * Subscribe to new messages for a specific order or sample conversation
 *
 * @example
 * ```graphql
 * subscription {
 *   newMessage(orderId: 123) {
 *     id
 *     content
 *     type
 *     orderId
 *     sampleId
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
    description:
      "Subscribe to new messages for a specific order or sample conversation",
    args: {
      orderId: t.arg.int({
        required: false,
        description: "Order ID",
      }),
      sampleId: t.arg.int({
        required: false,
        description: "Sample ID",
      }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      // Subscribe to either order or sample messages
      const channelKey = args.orderId || args.sampleId;
      if (!channelKey) {
        throw new Error("Either orderId or sampleId must be provided");
      }

      return pubsub.subscribe("message:new", channelKey);
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
 *   messageRead(orderId: 123) {
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
      orderId: t.arg.int({
        required: false,
        description: "Order ID to watch",
      }),
      sampleId: t.arg.int({
        required: false,
        description: "Sample ID to watch",
      }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      const channelKey = args.orderId || args.sampleId;
      if (!channelKey) {
        throw new Error("Either orderId or sampleId must be provided");
      }

      return pubsub.subscribe("message:read", channelKey);
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
 *     type
 *     orderId
 *     sampleId
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
