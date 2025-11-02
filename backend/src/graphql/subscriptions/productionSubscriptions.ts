/**
 * Production Tracking Subscriptions
 *
 * Real-time subscriptions for production status and quality control updates
 */

import { requireAuth } from "../../utils/errors";
import { pubsub } from "../../utils/pubsub";
import builder from "../builder";

/**
 * Production Status Event
 */
const ProductionStatusEvent = builder.objectRef<{
  productionId: number;
  status: string;
  previousStatus: string;
  currentStage?: string | null;
  estimatedCompletion?: Date | null;
  actualCompletion?: Date | null;
  updatedAt: Date;
}>("ProductionStatusEvent");

ProductionStatusEvent.implement({
  fields: (t) => ({
    productionId: t.exposeInt("productionId"),
    status: t.exposeString("status"),
    previousStatus: t.exposeString("previousStatus"),
    currentStage: t.exposeString("currentStage", { nullable: true }),
    estimatedCompletion: t.expose("estimatedCompletion", {
      type: "DateTime",
      nullable: true,
    }),
    actualCompletion: t.expose("actualCompletion", {
      type: "DateTime",
      nullable: true,
    }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

/**
 * Production Stage Event
 */
const ProductionStageEvent = builder.objectRef<{
  productionId: number;
  stage: string;
  status: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  notes?: string | null;
  updatedBy?: number | null;
  updatedAt: Date;
}>("ProductionStageEvent");

ProductionStageEvent.implement({
  fields: (t) => ({
    productionId: t.exposeInt("productionId"),
    stage: t.exposeString("stage"),
    status: t.exposeString("status"),
    startedAt: t.expose("startedAt", { type: "DateTime", nullable: true }),
    completedAt: t.expose("completedAt", { type: "DateTime", nullable: true }),
    notes: t.exposeString("notes", { nullable: true }),
    updatedBy: t.exposeInt("updatedBy", { nullable: true }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

// Quality Control Event removed - QualityControl model no longer exists

/**
 * Subscription: productionStatusChanged
 *
 * Subscribe to production status changes for a specific production tracking
 *
 * @example
 * ```graphql
 * subscription {
 *   productionStatusChanged(productionId: 123) {
 *     productionId
 *     status
 *     previousStatus
 *     currentStage
 *     updatedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("productionStatusChanged", (t) =>
  t.field({
    type: ProductionStatusEvent,
    authScopes: { user: true },
    description: "Subscribe to production status changes",
    args: {
      productionId: t.arg.int({
        required: true,
        description: "Production tracking ID to watch",
      }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("production:statusChanged", args.productionId);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: productionStageUpdated
 *
 * Subscribe to production stage updates (cutting, sewing, packaging, etc.)
 *
 * @example
 * ```graphql
 * subscription {
 *   productionStageUpdated(productionId: 123) {
 *     productionId
 *     stage
 *     status
 *     completedAt
 *     notes
 *   }
 * }
 * ```
 */
builder.subscriptionField("productionStageUpdated", (t) =>
  t.field({
    type: ProductionStageEvent,
    authScopes: { user: true },
    description: "Subscribe to production stage updates",
    args: {
      productionId: t.arg.int({
        required: true,
        description: "Production tracking ID to watch",
      }),
    },
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("production:stageUpdated", args.productionId);
    },
    resolve: (payload) => payload,
  })
);

// productionQualityControl subscription removed - QualityControl model no longer exists
