/**
 * Sample (Numune) Subscriptions
 *
 * Real-time subscriptions for sample status changes, quotes, and shipments
 */

import { requireAuth } from "../../utils/errors";
import { pubsub } from "../../utils/pubsub";
import builder from "../builder";

/**
 * Sample Status Event
 */
const SampleStatusEvent = builder.objectRef<{
  sampleId: number;
  status: string;
  previousStatus: string;
  sampleNumber?: string | null;
  updatedAt: Date;
  updatedBy?: number | null;
}>("SampleStatusEvent");

SampleStatusEvent.implement({
  fields: (t) => ({
    sampleId: t.exposeInt("sampleId"),
    status: t.exposeString("status"),
    previousStatus: t.exposeString("previousStatus"),
    sampleNumber: t.exposeString("sampleNumber", { nullable: true }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    updatedBy: t.exposeInt("updatedBy", { nullable: true }),
  }),
});

/**
 * Sample Quote Event
 */
const SampleQuoteEvent = builder.objectRef<{
  sampleId: number;
  sampleNumber?: string | null;
  quotedPrice?: number | null;
  quotedDays?: number | null;
  quoteNote?: string | null;
  quotedBy: number;
  quotedAt: Date;
}>("SampleQuoteEvent");

SampleQuoteEvent.implement({
  fields: (t) => ({
    sampleId: t.exposeInt("sampleId"),
    sampleNumber: t.exposeString("sampleNumber", { nullable: true }),
    quotedPrice: t.exposeFloat("quotedPrice", { nullable: true }),
    quotedDays: t.exposeInt("quotedDays", { nullable: true }),
    quoteNote: t.exposeString("quoteNote", { nullable: true }),
    quotedBy: t.exposeInt("quotedBy"),
    quotedAt: t.expose("quotedAt", { type: "DateTime" }),
  }),
});

/**
 * Sample Shipped Event
 */
const SampleShippedEvent = builder.objectRef<{
  sampleId: number;
  sampleNumber?: string | null;
  cargoTrackingNumber?: string | null;
  shippedAt: Date;
  estimatedDelivery?: Date | null;
}>("SampleShippedEvent");

SampleShippedEvent.implement({
  fields: (t) => ({
    sampleId: t.exposeInt("sampleId"),
    sampleNumber: t.exposeString("sampleNumber", { nullable: true }),
    cargoTrackingNumber: t.exposeString("cargoTrackingNumber", {
      nullable: true,
    }),
    shippedAt: t.expose("shippedAt", { type: "DateTime" }),
    estimatedDelivery: t.expose("estimatedDelivery", {
      type: "DateTime",
      nullable: true,
    }),
  }),
});

/**
 * Subscription: sampleStatusChanged
 *
 * Subscribe to sample status changes for a specific sample
 *
 * @example
 * ```graphql
 * subscription {
 *   sampleStatusChanged(sampleId: 123) {
 *     sampleId
 *     status
 *     previousStatus
 *     sampleNumber
 *     updatedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("sampleStatusChanged", (t) =>
  t.field({
    type: SampleStatusEvent,
    authScopes: { user: true },
    description: "Subscribe to sample status changes",
    args: {
      sampleId: t.arg.int({
        required: true,
        description: "Sample ID to watch",
      }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("sample:statusChanged", args.sampleId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: sampleQuoteReceived
 *
 * Subscribe to manufacturer quotes for a specific sample
 *
 * @example
 * ```graphql
 * subscription {
 *   sampleQuoteReceived(sampleId: 123) {
 *     sampleId
 *     quotedPrice
 *     quotedDays
 *     quoteNote
 *     quotedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("sampleQuoteReceived", (t) =>
  t.field({
    type: SampleQuoteEvent,
    authScopes: { user: true },
    description: "Subscribe to manufacturer quotes for samples",
    args: {
      sampleId: t.arg.int({
        required: true,
        description: "Sample ID to watch",
      }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("sample:quoteReceived", args.sampleId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: sampleShipped
 *
 * Subscribe to sample shipment notifications
 *
 * @example
 * ```graphql
 * subscription {
 *   sampleShipped(sampleId: 123) {
 *     sampleId
 *     sampleNumber
 *     cargoTrackingNumber
 *     shippedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("sampleShipped", (t) =>
  t.field({
    type: SampleShippedEvent,
    authScopes: { user: true },
    description: "Subscribe to sample shipment updates",
    args: {
      sampleId: t.arg.int({
        required: true,
        description: "Sample ID to watch",
      }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("sample:shipped", args.sampleId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: mySampleUpdates
 *
 * Subscribe to all sample updates for the authenticated user
 * (both as customer and manufacturer)
 *
 * @example
 * ```graphql
 * subscription {
 *   mySampleUpdates {
 *     sampleId
 *     status
 *     sampleNumber
 *     updatedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("mySampleUpdates", (t) =>
  t.field({
    type: SampleStatusEvent,
    authScopes: { user: true },
    description: "Subscribe to all sample updates for the authenticated user",
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      // Subscribe to user-specific sample updates channel
      return pubsub.subscribe("sample:userUpdates", context.user.id);
    },
    resolve: (payload) => payload,
  })
);
