/**
 * Task Subscriptions
 *
 * Real-time task subscriptions for task management
 */

import { requireAuth } from "../../utils/errors";
import { pubsub } from "../../utils/pubsub";
import { builder } from "../builder";

/**
 * Task Event Type for Subscriptions
 */
const TaskEvent = builder.objectRef<{
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
  assignedUserId?: number | null;
  createdById?: number | null;
  productionTrackingId?: number | null;
  orderId?: number | null;
  sampleId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}>("TaskEvent");

TaskEvent.implement({
  fields: (t) => ({
    id: t.exposeInt("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description", { nullable: true }),
    status: t.exposeString("status"),
    priority: t.exposeString("priority"),
    dueDate: t.expose("dueDate", { type: "DateTime", nullable: true }),
    assignedUserId: t.exposeInt("assignedUserId", { nullable: true }),
    createdById: t.exposeInt("createdById", { nullable: true }),
    productionTrackingId: t.exposeInt("productionTrackingId", { nullable: true }),
    orderId: t.exposeInt("orderId", { nullable: true }),
    sampleId: t.exposeInt("sampleId", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

/**
 * Task Status Changed Event
 */
const TaskStatusEvent = builder.objectRef<{
  taskId: number;
  status: string;
  previousStatus: string;
  updatedAt: Date;
  updatedBy?: number | null;
}>("TaskStatusEvent");

TaskStatusEvent.implement({
  fields: (t) => ({
    taskId: t.exposeInt("taskId"),
    status: t.exposeString("status"),
    previousStatus: t.exposeString("previousStatus"),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    updatedBy: t.exposeInt("updatedBy", { nullable: true }),
  }),
});

/**
 * Subscription: taskCreated
 *
 * Subscribe to new tasks assigned to the authenticated user
 *
 * @example
 * ```graphql
 * subscription {
 *   taskCreated {
 *     id
 *     title
 *     priority
 *     dueDate
 *   }
 * }
 * ```
 */
builder.subscriptionField("taskCreated", (t) =>
  t.field({
    type: TaskEvent,
    authScopes: { user: true },
    description: "Subscribe to new tasks created for the authenticated user",
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("task:created", context.user.id);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: taskAssigned
 *
 * Subscribe to tasks assigned to the authenticated user
 *
 * @example
 * ```graphql
 * subscription {
 *   taskAssigned {
 *     id
 *     title
 *     status
 *     priority
 *   }
 * }
 * ```
 */
builder.subscriptionField("taskAssigned", (t) =>
  t.field({
    type: TaskEvent,
    authScopes: { user: true },
    description: "Subscribe to tasks assigned to the authenticated user",
    subscribe: (root, args, context) => {
      requireAuth(context.user?.id);

      return pubsub.subscribe("task:assigned", context.user.id);
    },
    resolve: (payload) => payload,
  })
);

/**
 * Subscription: taskStatusChanged
 *
 * Subscribe to task status changes for a specific task
 *
 * @example
 * ```graphql
 * subscription {
 *   taskStatusChanged(taskId: 123) {
 *     taskId
 *     status
 *     previousStatus
 *     updatedAt
 *   }
 * }
 * ```
 */
builder.subscriptionField("taskStatusChanged", (t) =>
  t.field({
    type: TaskStatusEvent,
    authScopes: { user: true },
    description: "Subscribe to status changes for a specific task",
    args: {
      taskId: t.arg.int({ required: true, description: "Task ID to watch" }),
    },
    subscribe: (root, args) => {
      return pubsub.subscribe("task:statusChanged", args.taskId);
    },
    resolve: (payload) => payload,
  })
);
