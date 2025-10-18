/**
 * Helper Functions for Publishing Events
 *
 * These utilities make it easy to publish events to subscriptions
 * when creating or updating entities in mutations.
 */

import type {
    MessagePayload,
    MessageReadPayload,
    NotificationPayload,
    OrderQuotePayload,
    OrderShippedPayload,
    OrderStatusPayload,
    ProductionStagePayload,
    ProductionStatusPayload,
    QualityControlPayload,
    SampleQuotePayload,
    SampleShippedPayload,
    SampleStatusPayload,
    TaskPayload,
    TaskStatusPayload
} from "./pubsub";
import { pubsub } from "./pubsub";

// ========================================
// NOTIFICATION PUBLISH HELPERS
// ========================================

/**
 * Publish a new notification event
 */
export async function publishNotification(notification: NotificationPayload) {
  pubsub.publish("notification:new", notification.userId, notification);
}

// ========================================
// TASK PUBLISH HELPERS
// ========================================

/**
 * Publish a new task created event
 */
export async function publishTaskCreated(userId: number, task: TaskPayload) {
  pubsub.publish("task:created", userId, task);
}

/**
 * Publish a task assigned event
 */
export async function publishTaskAssigned(userId: number, task: TaskPayload) {
  pubsub.publish("task:assigned", userId, task);
}

/**
 * Publish a task status change event
 */
export async function publishTaskStatusChanged(taskId: number, payload: TaskStatusPayload) {
  pubsub.publish("task:statusChanged", taskId, payload);
}

// ========================================
// PRODUCTION PUBLISH HELPERS
// ========================================

/**
 * Publish a production status change event
 */
export async function publishProductionStatusChanged(
  productionId: number,
  payload: ProductionStatusPayload
) {
  pubsub.publish("production:statusChanged", productionId, payload);
}

/**
 * Publish a production stage update event
 */
export async function publishProductionStageUpdated(
  productionId: number,
  payload: ProductionStagePayload
) {
  pubsub.publish("production:stageUpdated", productionId, payload);
}

/**
 * Publish a quality control result event
 */
export async function publishQualityControl(
  productionId: number,
  payload: QualityControlPayload
) {
  pubsub.publish("production:qualityControl", productionId, payload);
}

// ========================================
// SAMPLE PUBLISH HELPERS
// ========================================

/**
 * Publish a sample status change event
 */
export async function publishSampleStatusChanged(
  sampleId: number,
  payload: SampleStatusPayload
) {
  pubsub.publish("sample:statusChanged", sampleId, payload);
}

/**
 * Publish a sample quote received event
 */
export async function publishSampleQuoteReceived(
  sampleId: number,
  payload: SampleQuotePayload
) {
  pubsub.publish("sample:quoteReceived", sampleId, payload);
}

/**
 * Publish a sample shipped event
 */
export async function publishSampleShipped(
  sampleId: number,
  payload: SampleShippedPayload
) {
  pubsub.publish("sample:shipped", sampleId, payload);
}

/**
 * Publish sample update to user
 */
export async function publishSampleUserUpdate(
  userId: number,
  payload: SampleStatusPayload
) {
  pubsub.publish("sample:userUpdates", userId, payload);
}

// ========================================
// ORDER PUBLISH HELPERS
// ========================================

/**
 * Publish an order status change event
 */
export async function publishOrderStatusChanged(
  orderId: number,
  payload: OrderStatusPayload
) {
  pubsub.publish("order:statusChanged", orderId, payload);
}

/**
 * Publish an order quote received event
 */
export async function publishOrderQuoteReceived(
  orderId: number,
  payload: OrderQuotePayload
) {
  pubsub.publish("order:quoteReceived", orderId, payload);
}

/**
 * Publish an order shipped event
 */
export async function publishOrderShipped(
  orderId: number,
  payload: OrderShippedPayload
) {
  pubsub.publish("order:shipped", orderId, payload);
}

/**
 * Publish order update to user
 */
export async function publishOrderUserUpdate(
  userId: number,
  payload: OrderStatusPayload
) {
  pubsub.publish("order:userUpdates", userId, payload);
}

// ========================================
// MESSAGE PUBLISH HELPERS
// ========================================

/**
 * Publish a new message event
 */
export async function publishNewMessage(
  productId: number,
  payload: MessagePayload
) {
  pubsub.publish("message:new", productId, payload);
}

/**
 * Publish message to user's personal channel
 */
export async function publishUserMessage(
  userId: number,
  payload: MessagePayload
) {
  pubsub.publish("message:userReceived", userId, payload);
}

/**
 * Publish a message read event
 */
export async function publishMessageRead(
  productId: number,
  payload: MessageReadPayload
) {
  pubsub.publish("message:read", productId, payload);
}
