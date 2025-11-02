/**
 * Order (Sipariş) Subscriptions
 *
 * Real-time subscriptions for order status changes, quotes, and shipments
 */

import { requireAuth } from "../../utils/errors";
import { pubsub } from "../../utils/pubsub";
import builder from "../builder";

/**
 * Order Status Event
 */
const OrderStatusEvent = builder.objectRef<{
  orderId: number;
  orderNumber?: string | null;
  status: string;
  previousStatus: string;
  updatedAt: Date;
  updatedBy?: number | null;
}>("OrderStatusEvent");

OrderStatusEvent.implement({
  fields: (t) => ({
    orderId: t.exposeInt("orderId"),
    orderNumber: t.exposeString("orderNumber", { nullable: true }),
    status: t.exposeString("status"),
    previousStatus: t.exposeString("previousStatus"),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    updatedBy: t.exposeInt("updatedBy", { nullable: true }),
  }),
});

/**
 * Order Quote Event
 */
const OrderQuoteEvent = builder.objectRef<{
  orderId: number;
  orderNumber?: string | null;
  quotedPrice?: number | null;
  quotedDays?: number | null;
  quoteNote?: string | null;
  quoteType?: string | null;
  quotedBy: number;
  quotedAt: Date;
}>("OrderQuoteEvent");

OrderQuoteEvent.implement({
  fields: (t) => ({
    orderId: t.exposeInt("orderId"),
    orderNumber: t.exposeString("orderNumber", { nullable: true }),
    quotedPrice: t.exposeFloat("quotedPrice", { nullable: true }),
    quotedDays: t.exposeInt("quotedDays", { nullable: true }),
    quoteNote: t.exposeString("quoteNote", { nullable: true }),
    quoteType: t.exposeString("quoteType", { nullable: true }),
    quotedBy: t.exposeInt("quotedBy"),
    quotedAt: t.expose("quotedAt", { type: "DateTime" }),
  }),
});

/**
 * Order Shipped Event
 */
const OrderShippedEvent = builder.objectRef<{
  orderId: number;
  orderNumber?: string | null;
  cargoTrackingNumber?: string | null;
  shippedAt: Date;
  deliveryAddress?: string | null;
  estimatedDelivery?: Date | null;
}>("OrderShippedEvent");

OrderShippedEvent.implement({
  fields: (t) => ({
    orderId: t.exposeInt("orderId"),
    orderNumber: t.exposeString("orderNumber", { nullable: true }),
    cargoTrackingNumber: t.exposeString("cargoTrackingNumber", {
      nullable: true,
    }),
    shippedAt: t.expose("shippedAt", { type: "DateTime" }),
    deliveryAddress: t.exposeString("deliveryAddress", { nullable: true }),
    estimatedDelivery: t.expose("estimatedDelivery", {
      type: "DateTime",
      nullable: true,
    }),
  }),
});

/**
 * Subscription: orderStatusChanged
 *
 * Subscribe to order status changes for a specific order
 *
 * @example
 * ```graphql
 * subscription {
 *   orderStatusChanged(orderId: 123) {
 *     orderId
 *     orderNumber
 *     status
 *     previousStatus
 *     updatedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("orderStatusChanged", (t) =>
  t.field({
    type: OrderStatusEvent,
    authScopes: { user: true },
    description: "Subscribe to order status changes",
    args: {
      orderId: t.arg.int({ required: true, description: "Order ID to watch" }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("order:statusChanged", args.orderId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: orderQuoteReceived
 *
 * Subscribe to customer/manufacturer quotes for a specific order
 *
 * @example
 * ```graphql
 * subscription {
 *   orderQuoteReceived(orderId: 123) {
 *     orderId
 *     quotedPrice
 *     quotedDays
 *     quoteNote
 *     quoteType
 *     quotedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("orderQuoteReceived", (t) =>
  t.field({
    type: OrderQuoteEvent,
    authScopes: { user: true },
    description: "Subscribe to quotes for orders",
    args: {
      orderId: t.arg.int({ required: true, description: "Order ID to watch" }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("order:quoteReceived", args.orderId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: orderShipped
 *
 * Subscribe to order shipment notifications
 *
 * @example
 * ```graphql
 * subscription {
 *   orderShipped(orderId: 123) {
 *     orderId
 *     orderNumber
 *     cargoTrackingNumber
 *     shippedAt
 *     deliveryAddress
 *   }
 * }
 * ```
 */
builder.subscriptionField("orderShipped", (t) =>
  t.field({
    type: OrderShippedEvent,
    authScopes: { user: true },
    description: "Subscribe to order shipment updates",
    args: {
      orderId: t.arg.int({ required: true, description: "Order ID to watch" }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("order:shipped", args.orderId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: myOrderUpdates
 *
 * Subscribe to all order updates for the authenticated user
 * (both as customer and manufacturer)
 *
 * @example
 * ```graphql
 * subscription {
 *   myOrderUpdates {
 *     orderId
 *     orderNumber
 *     status
 *     updatedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("myOrderUpdates", (t) =>
  t.field({
    type: OrderStatusEvent,
    authScopes: { user: true },
    description: "Subscribe to all order updates for the authenticated user",
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      // Subscribe to user-specific order updates channel
      return pubsub.subscribe("order:userUpdates", context.user.id);
    },
    resolve: (payload) => payload,
  })
);
